import { describe, it, expect } from "vitest";
import { performance } from "perf_hooks";
import { record } from "./perf-report.js";

const API_BASE =
    process.env.WEBTOOLS_API_BASE || "https://web-tools-ashen.vercel.app/api";
const TOKEN = process.env.WEBTOOLS_TEST_TOKEN;

const describeWithToken = TOKEN ? describe : describe.skip;

describe("lists endpoint auth and CORS", () => {
    it("GET /lists returns 401 without a token", async () => {
        const start = performance.now();
        const res = await fetch(`${API_BASE}/lists`);
        const ms = performance.now() - start;
        record("GET /lists", "no token", ms, res.status);
        expect(res.status).toBe(401);
    });

    it("GET /lists returns 401 with a wrong token", async () => {
        const res = await fetch(`${API_BASE}/lists`, {
            headers: { "X-Project-Token": "definitely-not-valid" },
        });
        expect(res.status).toBe(401);
    });

    it("GET /lists/[slug] returns 401 without a token", async () => {
        const start = performance.now();
        const res = await fetch(`${API_BASE}/lists/anything`);
        const ms = performance.now() - start;
        record("GET /lists/[slug]", "no token", ms, res.status);
        expect(res.status).toBe(401);
    });

    it("OPTIONS /lists returns 204 with CORS headers", async () => {
        const res = await fetch(`${API_BASE}/lists`, { method: "OPTIONS" });
        expect(res.status).toBe(204);
        expect(res.headers.get("access-control-allow-origin")).toBe("*");
    });

    it("OPTIONS /lists/[slug] returns 204 with CORS headers", async () => {
        const res = await fetch(`${API_BASE}/lists/any-slug`, {
            method: "OPTIONS",
        });
        expect(res.status).toBe(204);
        expect(res.headers.get("access-control-allow-origin")).toBe("*");
    });
});

describeWithToken("lists endpoint with a valid token", () => {
    it("GET /lists returns an array", async () => {
        const start = performance.now();
        const res = await fetch(`${API_BASE}/lists`, {
            headers: { "X-Project-Token": TOKEN },
        });
        const ms = performance.now() - start;
        const data = await res.json();
        record("GET /lists", `${data.length} lists`, ms, res.status);
        expect(res.status).toBe(200);
        expect(res.headers.get("content-type")).toMatch(/application\/json/);
        expect(Array.isArray(data)).toBe(true);
    });

    it("every list has a slug", async () => {
        const res = await fetch(`${API_BASE}/lists`, {
            headers: { "X-Project-Token": TOKEN },
        });
        const data = await res.json();
        for (const list of data) {
            expect(list).toHaveProperty("slug");
            expect(typeof list.slug).toBe("string");
        }
    });

    it("returns 404 when the slug does not exist", async () => {
        const start = performance.now();
        const res = await fetch(
            `${API_BASE}/lists/slug-that-does-not-exist`,
            { headers: { "X-Project-Token": TOKEN } },
        );
        const ms = performance.now() - start;
        record("GET /lists/[slug]", "non-existent slug", ms, res.status);
        expect(res.status).toBe(404);
        const body = await res.json();
        expect(body.error).toMatch(/not found/i);
    });

    it("GET /lists/[slug] returns the same list we got from /lists", async () => {
        const all = await fetch(`${API_BASE}/lists`, {
            headers: { "X-Project-Token": TOKEN },
        }).then((r) => r.json());

        if (all.length === 0) {
            console.warn("no lists on this project, skipping the lookup test");
            return;
        }

        const first = all[0];
        const start = performance.now();
        const res = await fetch(`${API_BASE}/lists/${first.slug}`, {
            headers: { "X-Project-Token": TOKEN },
        });
        const ms = performance.now() - start;
        record("GET /lists/[slug]", `slug="${first.slug}"`, ms, res.status);
        expect(res.status).toBe(200);
        const list = await res.json();
        expect(list.slug).toBe(first.slug);
    });

    it("GET /lists/test returns the test list with the right fields", async () => {
        const start = performance.now();
        const res = await fetch(`${API_BASE}/lists/test`, {
            headers: { "X-Project-Token": TOKEN },
        });
        const ms = performance.now() - start;

        if (res.status === 404) {
            record("GET /lists/test", "not found", ms, 404);
            console.warn("no list with slug 'test' on this project, skipping");
            return;
        }

        const list = await res.json();
        record("GET /lists/test", `${list.fields?.length} fields, ${list.items?.length} items`, ms, res.status);

        expect(res.status).toBe(200);
        expect(list.slug).toBe("test");
        expect(list.name).toBe("test");
        expect(Array.isArray(list.fields)).toBe(true);
        expect(Array.isArray(list.items)).toBe(true);

        const fieldsByName = Object.fromEntries(
            list.fields.map((f) => [f.name, f]),
        );
        expect(fieldsByName.title).toMatchObject({ type: "text", required: true });
        expect(fieldsByName.number?.type).toBe("number");
        expect(fieldsByName.date?.type).toBe("date");
        expect(fieldsByName.bool?.type).toBe("boolean");
        expect(fieldsByName.select?.type).toBe("select");
        expect(fieldsByName.select?.options).toEqual(
            expect.arrayContaining(["Test", "Test 2"]),
        );
        expect(fieldsByName.url?.type).toBe("url");
        expect(fieldsByName.wysiwyg?.type).toBe("richtext");

        const allowed = new Set(list.fields.map((f) => f.name));
        for (const item of list.items) {
            expect(item).toHaveProperty("values");
            for (const key of Object.keys(item.values)) {
                expect(allowed.has(key)).toBe(true);
            }
        }
    });
});
