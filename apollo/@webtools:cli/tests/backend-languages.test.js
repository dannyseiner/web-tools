import { describe, it, expect } from "vitest";
import { performance } from "perf_hooks";
import { record } from "./perf-report.js";

const API_BASE =
    process.env.WEBTOOLS_API_BASE || "https://web-tools-ashen.vercel.app/api";
const TOKEN = process.env.WEBTOOLS_TEST_TOKEN;

const describeWithToken = TOKEN ? describe : describe.skip;

describe("languages endpoint auth", () => {
    it("returns 401 without a token", async () => {
        const start = performance.now();
        const res = await fetch(`${API_BASE}/i18n/languages`);
        const ms = performance.now() - start;
        record("GET /i18n/languages", "no token", ms, res.status);
        expect(res.status).toBe(401);
    });

    it("returns 401 with a wrong token", async () => {
        const res = await fetch(`${API_BASE}/i18n/languages`, {
            headers: { "X-Project-Token": "nope" },
        });
        expect(res.status).toBe(401);
    });
});

describeWithToken("languages endpoint with a valid token", () => {
    it("returns an array", async () => {
        const start = performance.now();
        const res = await fetch(`${API_BASE}/i18n/languages`, {
            headers: { "X-Project-Token": TOKEN },
        });
        const ms = performance.now() - start;
        const data = await res.json();
        record("GET /i18n/languages", `${data.length} languages`, ms, res.status);
        expect(res.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
    });

    it("returns only code, name and nativeName — no internal fields", async () => {
        const res = await fetch(`${API_BASE}/i18n/languages`, {
            headers: { "X-Project-Token": TOKEN },
        });
        const data = await res.json();

        for (const lang of data) {
            expect(lang).toHaveProperty("code");
            expect(lang).toHaveProperty("name");
            expect(lang).toHaveProperty("nativeName");
            expect(typeof lang.code).toBe("string");
            expect(lang.code.length).toBeGreaterThan(0);
            expect(lang).not.toHaveProperty("_id");
            expect(lang).not.toHaveProperty("projectId");
        }
    });

    it("does not return the same language twice", async () => {
        const res = await fetch(`${API_BASE}/i18n/languages`, {
            headers: { "X-Project-Token": TOKEN },
        });
        const data = await res.json();
        const codes = data.map((l) => l.code);
        expect(new Set(codes).size).toBe(codes.length);
    });
});
