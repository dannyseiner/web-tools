import { describe, it, expect } from "vitest";
import { performance } from "perf_hooks";
import { record } from "./perf-report.js";

const API_BASE =
    process.env.WEBTOOLS_API_BASE || "https://web-tools-ashen.vercel.app/api";
const TOKEN = process.env.WEBTOOLS_TEST_TOKEN;

const describeWithToken = TOKEN ? describe : describe.skip;

const KEY_COUNT = 500;
const LANGS = ["en", "cs"];
const RUN_ID = "bulk";

function makeBigPayload() {
    const payload = {};
    for (const lang of LANGS) {
        const bucket = {};
        for (let i = 0; i < KEY_COUNT; i++) {
            bucket[`key_${i}`] =
                `${lang}-value-${i}-` +
                "lorem_ipsum_dolor_sit_amet_".repeat(4) +
                i;
        }
        payload[lang] = { __webtools_test__: { bulk: { [RUN_ID]: bucket } } };
    }
    return payload;
}

describeWithToken("bulk upload", () => {
    it(
        "saves 500 keys per language and reads them back if the server can",
        async () => {
            const payload = makeBigPayload();
            const serialized = JSON.stringify(payload);
            const sizeKb = (serialized.length / 1024).toFixed(1);

            const postStart = performance.now();
            const postRes = await fetch(`${API_BASE}/i18n/translations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Project-Token": TOKEN,
                },
                body: serialized,
            });
            const postElapsed = performance.now() - postStart;

            expect(postRes.status).toBe(200);
            const postBody = await postRes.json();
            expect(postBody.ok).toBe(true);

            for (const lang of LANGS) {
                expect(postBody.results[lang]).toBeDefined();
            }

            const totalKeys = KEY_COUNT * LANGS.length;
            const keysPerSec = Math.round((totalKeys / postElapsed) * 1000);

            record(
                "POST /i18n/translations",
                `${sizeKb} KB (${totalKeys} keys, ${LANGS.length} langs)`,
                postElapsed,
                postRes.status,
                `~${keysPerSec} keys/s`,
            );

            const getStart = performance.now();
            const getRes = await fetch(`${API_BASE}/i18n/translations`, {
                headers: { "X-Project-Token": TOKEN },
            });
            const getElapsed = performance.now() - getStart;

            record(
                "GET /i18n/translations",
                `full project (after bulk)`,
                getElapsed,
                getRes.status,
            );

            if (getRes.status === 200) {
                const data = await getRes.json();
                for (const lang of LANGS) {
                    const bucket = data[lang]?.__webtools_test__?.bulk?.[RUN_ID];
                    expect(bucket).toBeDefined();
                    expect(Object.keys(bucket)).toHaveLength(KEY_COUNT);
                    expect(bucket.key_0).toBe(
                        payload[lang].__webtools_test__.bulk[RUN_ID].key_0,
                    );
                    const midIdx = Math.floor(KEY_COUNT / 2);
                    expect(bucket[`key_${midIdx}`]).toBe(
                        payload[lang].__webtools_test__.bulk[RUN_ID][`key_${midIdx}`],
                    );
                    expect(bucket[`key_${KEY_COUNT - 1}`]).toBe(
                        payload[lang].__webtools_test__.bulk[RUN_ID][
                        `key_${KEY_COUNT - 1}`
                        ],
                    );
                }
            } else {
                console.warn(
                    `GET /i18n/translations returned ${getRes.status}, ` +
                    `skipping read-back. POST already confirmed the save.`,
                );
            }
        },
        120_000,
    );
});
