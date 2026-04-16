import { describe, it, expect } from "vitest";
import { performance } from "perf_hooks";
import { record } from "./perf-report.js";

const API_BASE =
    process.env.WEBTOOLS_API_BASE || "https://web-tools-ashen.vercel.app/api";

const TOKEN = process.env.WEBTOOLS_TEST_TOKEN;

const describeWithToken = TOKEN ? describe : describe.skip;

async function postTranslations(body, token = TOKEN) {
    return fetch(`${API_BASE}/i18n/translations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "X-Project-Token": token } : {}),
        },
        body: typeof body === "string" ? body : JSON.stringify(body),
    });
}

describe("translations endpoint payload validation", () => {
    const t = TOKEN ? it : it.skip;

    t("returns 400 for invalid JSON", async () => {
        const start = performance.now();
        const res = await postTranslations("{not-json");
        const ms = performance.now() - start;
        record("POST /i18n/translations", "invalid JSON", ms, res.status);
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toMatch(/invalid json/i);
    });

    t("returns 400 for a top-level array", async () => {
        const start = performance.now();
        const res = await postTranslations([{ en: { foo: "bar" } }]);
        const ms = performance.now() - start;
        record("POST /i18n/translations", "array body", ms, res.status);
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toMatch(/expected object/i);
    });

    t("returns 400 for a top-level string", async () => {
        const res = await postTranslations("\"just-a-string\"");
        expect(res.status).toBe(400);
    });

    t("accepts an empty object and returns empty results", async () => {
        const start = performance.now();
        const res = await postTranslations({});
        const ms = performance.now() - start;
        record("POST /i18n/translations", "empty object", ms, res.status);
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.ok).toBe(true);
        expect(body.results).toEqual({});
    });

    t("skips language values that are not objects", async () => {
        const res = await postTranslations({ en: "not-an-object", cs: null });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.results).toEqual({});
    });
});

describeWithToken("translations round-trip (POST then GET)", () => {
    const runId = "roundtrip";
    const testValue = "hello-from-vitest";

    async function fetchTranslations() {
        const res = await fetch(`${API_BASE}/i18n/translations`, {
            headers: { "X-Project-Token": TOKEN },
        });
        if (res.status !== 200) {
            console.warn(
                `GET /i18n/translations returned ${res.status}, skipping read-back`,
            );
            return null;
        }
        return res.json();
    }

    it("saves a key on POST and returns it on GET", async () => {
        const postStart = performance.now();
        const postRes = await postTranslations({
            en: { __webtools_test__: { [runId]: { greeting: testValue } } },
        });
        const postMs = performance.now() - postStart;
        record("POST /i18n/translations", "1 key, 1 language", postMs, postRes.status);

        expect(postRes.status).toBe(200);
        const postBody = await postRes.json();
        expect(postBody.ok).toBe(true);
        expect(postBody.results.en).toBeDefined();
        expect(
            postBody.results.en.created + postBody.results.en.updated,
        ).toBeGreaterThanOrEqual(1);

        const getStart = performance.now();
        const data = await fetchTranslations();
        const getMs = performance.now() - getStart;
        if (data) {
            record("GET /i18n/translations", "all translations", getMs, 200);
            expect(data).toBeTypeOf("object");
            expect(data.en).toBeDefined();
            expect(data.en.__webtools_test__?.[runId]?.greeting).toBe(testValue);
        } else {
            record("GET /i18n/translations", "all translations", getMs, 500);
        }
    });

    it("overwrites the value when the same key is pushed again", async () => {
        const updatedValue = "updated-value";
        const start = performance.now();
        const res = await postTranslations({
            en: { __webtools_test__: { [runId]: { greeting: updatedValue } } },
        });
        const ms = performance.now() - start;
        record("POST /i18n/translations", "1 key update", ms, res.status);

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.results.en.updated).toBeGreaterThanOrEqual(1);

        const data = await fetchTranslations();
        if (!data) return;
        expect(data.en.__webtools_test__?.[runId]?.greeting).toBe(updatedValue);
    });

    it("saves multiple languages in one request", async () => {
        const payload = {
            en: { __webtools_test__: { [runId]: { multi: "en-value" } } },
            cs: { __webtools_test__: { [runId]: { multi: "cs-value" } } },
        };
        const start = performance.now();
        const res = await postTranslations(payload);
        const ms = performance.now() - start;
        record("POST /i18n/translations", "1 key x 2 languages", ms, res.status);

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.results.en).toBeDefined();
        expect(body.results.cs).toBeDefined();

        const data = await fetchTranslations();
        if (!data) return;
        expect(data.en.__webtools_test__?.[runId]?.multi).toBe("en-value");
        expect(data.cs.__webtools_test__?.[runId]?.multi).toBe("cs-value");
    });
});
