#!/usr/bin/env node

import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const DEFAULT_API_PATH = "http://localhost:3000/api";
const PROJECT_TOKEN_ENV = "WEBTOOLS_PROJECT_TOKEN";

const RESET = "\x1b[0m";
const ORANGE = "\x1b[38;5;208m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";

const PREFIX = `${ORANGE}[WEB-TOOLS]${RESET}`;

function log(msg) {
    console.log(`${PREFIX} ${msg}`);
}

function logDim(msg) {
    console.log(`${PREFIX} ${DIM}${msg}${RESET}`);
}

function logError(msg) {
    console.error(`${PREFIX} ${RED}${msg}${RESET}`);
}

const envPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    logDim("env loaded");
} else {
    logDim("no .env found");
}

const API_PATH = process.env.API_PATH || DEFAULT_API_PATH;

const command = process.argv[2];

function printHelp() {
    console.log(`
WebTools CLI

Usage:
  ws init     Download translations and write to .messages/{lang}.json
  ws pull     (todo)
  ws push     (todo)

Env (required for init/pull/push):
  ${PROJECT_TOKEN_ENV}   Project API token (sent as X-Project-Token header)
  API_PATH               Base API url (default: ${DEFAULT_API_PATH})
`);
}

function requireProjectToken() {
    const token = process.env[PROJECT_TOKEN_ENV];
    if (!token || typeof token !== "string" || token.trim() === "") {
        throw new Error(
            `Missing ${PROJECT_TOKEN_ENV}. Add it to .env or export it. See "ws" for help.`
        );
    }
    return token.trim();
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

async function fetchTranslations() {
    const token = requireProjectToken();
    const url = `${API_PATH.replace(/\/$/, "")}/i18n/translations`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "X-Project-Token": token,
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Request failed (${res.status} ${res.statusText}) at ${url}${text ? `\n${text}` : ""}`);
    }

    const data = await res.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error(
            `Unexpected response from ${url}. Expected object like { "cs": { "common": {...} }, "en": {...} }`
        );
    }

    return data;
}

async function init() {
    log("initializing project...");

    const outDir = path.resolve(process.cwd(), ".messages");
    ensureDir(outDir);

    log(`fetching translations from ${API_PATH}`);
    const translationsByLang = await fetchTranslations();

    const langs = Object.keys(translationsByLang);
    if (langs.length === 0) {
        log("no languages returned from API, nothing to write");
        return;
    }

    let written = 0;

    for (const lang of langs) {
        const value = translationsByLang[lang];

        if (!value || typeof value !== "object" || Array.isArray(value)) {
            logDim(`skipping "${lang}" (expected object, got ${Array.isArray(value) ? "array" : typeof value})`);
            continue;
        }

        const filePath = path.join(outDir, `${lang}.json`);
        fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
        written += 1;
        logDim(`wrote ${filePath}`);
    }

    log(`done. wrote ${written} file(s) to ${outDir}`);
}

(async () => {
    try {
        switch (command) {
            case "pull":
                log("pulling translations... (todo)");
                break;

            case "push":
                log("pushing translations... (todo)");
                break;

            case "init":
                await init();
                break;

            default:
                printHelp();
        }
    } catch (err) {
        logError(err?.message || err);
        process.exit(1);
    }
})();
