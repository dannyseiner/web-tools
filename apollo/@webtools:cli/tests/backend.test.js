import { describe, it, expect } from "vitest";
import { performance } from "perf_hooks";
import { record } from "./perf-report.js";

const API_BASE =
    process.env.WEBTOOLS_API_BASE || "https://web-tools-ashen.vercel.app/api";

const authedEndpoints = [
    { method: "GET", path: "/lists" },
    { method: "GET", path: "/i18n/translations" },
    { method: "GET", path: "/i18n/languages" },
];

describe("requests without a token", () => {
    it.each(authedEndpoints)(
        "returns 401 for $method $path",
        async ({ method, path }) => {
            const start = performance.now();
            const res = await fetch(`${API_BASE}${path}`, { method });
            const ms = performance.now() - start;
            record(`${method} ${path}`, "no token", ms, res.status);
            expect(res.status).toBe(401);
            const body = await res.text();
            expect(body).toMatch(/missing authorization token/i);
        },
    );

    it("returns 401 when the token is wrong", async () => {
        const start = performance.now();
        const res = await fetch(`${API_BASE}/lists`, {
            headers: { "X-Project-Token": "definitely-not-a-real-token" },
        });
        const ms = performance.now() - start;
        record("GET /lists", "invalid token", ms, res.status);
        expect(res.status).toBe(401);
        const body = await res.text();
        expect(body).toMatch(/invalid authorization token/i);
    });

    it("returns 401 for POST /i18n/translations without a token", async () => {
        const start = performance.now();
        const res = await fetch(`${API_BASE}/i18n/translations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        const ms = performance.now() - start;
        record("POST /i18n/translations", "no token, empty body", ms, res.status);
        expect(res.status).toBe(401);
    });
});

describe("CORS", () => {
    it("OPTIONS /lists returns 204 with the right headers", async () => {
        const start = performance.now();
        const res = await fetch(`${API_BASE}/lists`, { method: "OPTIONS" });
        const ms = performance.now() - start;
        record("OPTIONS /lists", "preflight", ms, res.status);
        expect(res.status).toBe(204);
        expect(res.headers.get("access-control-allow-origin")).toBe("*");
        const allowedHeaders =
            res.headers.get("access-control-allow-headers") || "";
        expect(allowedHeaders.toLowerCase()).toContain("x-project-token");
    });

    it("401 responses still include CORS headers", async () => {
        const res = await fetch(`${API_BASE}/lists`);
        expect(res.status).toBe(401);
        expect(res.headers.get("access-control-allow-origin")).toBe("*");
    });
});

describe("public endpoints", () => {
    it("GET /organizations works without a token", async () => {
        const start = performance.now();
        const res = await fetch(`${API_BASE}/organizations`);
        const ms = performance.now() - start;
        record("GET /organizations", "public, no token", ms, res.status);
        expect([200, 204]).toContain(res.status);
    });
});
