import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import { performance } from "perf_hooks";
import { record } from "./perf-report.js";

import {
    ensureDir,
    writeJson,
    readJson,
    listDirs,
    listJsonFiles,
} from "../src/files.js";

const LANGS = ["en", "cs", "de", "fr", "es"];
const NAMESPACES = ["common", "auth", "dashboard", "errors"];
const KEYS_PER_NS = 50;
const TOTAL_FILES = LANGS.length * NAMESPACES.length;
const TOTAL_KEYS = TOTAL_FILES * KEYS_PER_NS;

function makeTranslations(lang, ns) {
    const out = {};
    for (let i = 0; i < KEYS_PER_NS; i++) {
        out[`${ns}.key_${i}`] = `${lang}:${ns}:value_${i}`;
    }
    return out;
}

let tmpDir;
let messagesDir;

beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "webtools-cli-speed-"));
    messagesDir = path.join(tmpDir, "messages");
    ensureDir(messagesDir);

    for (const lang of LANGS) {
        const langDir = path.join(messagesDir, lang);
        ensureDir(langDir);
        for (const ns of NAMESPACES) {
            writeJson(path.join(langDir, `${ns}.json`), makeTranslations(lang, ns));
        }
    }
});

afterAll(() => {
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("CLI file I/O speed", () => {
    it("reads all translation files and builds the push payload", () => {
        const start = performance.now();

        const payload = {};
        for (const lang of listDirs(messagesDir)) {
            payload[lang] = {};
            const files = listJsonFiles(path.join(messagesDir, lang));
            for (const file of files) {
                const ns = path.basename(file, ".json");
                payload[lang][ns] = readJson(path.join(messagesDir, lang, file));
            }
        }

        const elapsed = performance.now() - start;

        expect(Object.keys(payload)).toHaveLength(LANGS.length);
        expect(Object.keys(payload.en)).toHaveLength(NAMESPACES.length);
        expect(Object.keys(payload.en.common)).toHaveLength(KEYS_PER_NS);
        expect(elapsed).toBeLessThan(500);

        record(
            "disk read (build payload)",
            `${TOTAL_FILES} files, ${TOTAL_KEYS} keys`,
            elapsed,
            "-",
        );
    });

    it("writes all translation files to disk", () => {
        const writeDir = path.join(tmpDir, "write-test");
        ensureDir(writeDir);

        const start = performance.now();
        for (const lang of LANGS) {
            const langDir = path.join(writeDir, lang);
            ensureDir(langDir);
            for (const ns of NAMESPACES) {
                writeJson(
                    path.join(langDir, `${ns}.json`),
                    makeTranslations(lang, ns),
                );
            }
        }
        const elapsed = performance.now() - start;

        expect(elapsed).toBeLessThan(500);

        record(
            "disk write (save files)",
            `${TOTAL_FILES} files, ${TOTAL_KEYS} keys`,
            elapsed,
            "-",
        );
    });

    it("serializes the full payload to JSON", () => {
        const payload = {};
        for (const lang of LANGS) {
            payload[lang] = {};
            for (const ns of NAMESPACES) {
                payload[lang][ns] = makeTranslations(lang, ns);
            }
        }

        const start = performance.now();
        const serialized = JSON.stringify(payload);
        const elapsed = performance.now() - start;
        const sizeKb = (serialized.length / 1024).toFixed(1);

        expect(serialized.length).toBeGreaterThan(0);
        expect(elapsed).toBeLessThan(50);

        record(
            "JSON.stringify (payload)",
            `${sizeKb} KB`,
            elapsed,
            "-",
        );
    });
});
