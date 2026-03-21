#!/usr/bin/env node

import dotenv from "dotenv";
import path from "path";

import { logError, logDim, RESET, DIM, CYAN } from "./logger.js";

import { exists } from "./files.js";

import { pull } from "./commands/pull.js";
import { push } from "./commands/push.js";
import { init } from "./commands/init.js";
import { status } from "./commands/status.js";
import { help } from "./commands/help.js";

const TOKEN_ENV = "NEXT_PUBLIC_WEBTOOLS_PROJECT_TOKEN";

function loadEnv() {
    const candidates = [".env.local", ".env"];
    for (const name of candidates) {
        const envPath = path.resolve(process.cwd(), name);
        if (exists(envPath)) {
            dotenv.config({ path: envPath });
            logDim(`loaded ${name}`);
            return;
        }
    }
    logDim("no .env file found");
}

function requireToken() {
    const token = process.env[TOKEN_ENV];
    if (!token || token.trim() === "") {
        logError(`Missing ${TOKEN_ENV}. Add it to your .env.`);
        logDim(`Run ${CYAN}npx @uu-webtools/cli init${RESET}${DIM} for setup help.`);
        process.exit(1);
    }
    return token.trim();
}


loadEnv();

const command = process.argv[2];

(async () => {
    try {
        switch (command) {
            case "init":
                await init();
                break;
            case "pull":
                await pull(requireToken());
                break;
            case "push":
                await push(requireToken());
                break;
            case "status":
                await status(requireToken());
                break;
            case "help":
            case "--help":
            case "-h":
            case undefined:
                help();
                break;
            default:
                logError(`unknown command: ${command}`);
                help();
                process.exit(1);
        }
    } catch (err) {
        logError(err?.message || err);
        process.exit(1);
    }
})();
