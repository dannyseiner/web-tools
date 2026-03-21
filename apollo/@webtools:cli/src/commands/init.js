import path from "path";
import { log, logSuccess, logDim, logWarn } from "../logger.js";
import { ensureDir, resolveMessagesDir, exists, readText, writeText, appendText } from "../files.js";
import { pull } from "./pull.js";

const TOKEN_ENV = "NEXT_PUBLIC_WEBTOOLS_PROJECT_TOKEN";

export async function init() {
    log("initializing webtools...");

    const messagesDir = resolveMessagesDir();
    ensureDir(messagesDir);

    const envPath = path.resolve(process.cwd(), ".env.local");
    if (!exists(envPath)) {
        writeText(envPath, `# WebTools\n${TOKEN_ENV}=your-token-here\n`);
        logSuccess("created .env.local");
        logWarn(`set your project token in .env.local (${TOKEN_ENV})`);
    } else {
        const envContent = readText(envPath);
        if (!envContent.includes(TOKEN_ENV)) {
            appendText(envPath, `\n# WebTools\n${TOKEN_ENV}=your-token-here\n`);
            logSuccess(`added ${TOKEN_ENV} to .env.local`);
            logWarn("don't forget to set your actual project token");
        } else {
            logDim(".env.local already configured");
        }
    }

    const token = process.env[TOKEN_ENV];
    if (token && token.trim() && token.trim() !== "your-token-here") {
        log("token found, pulling translations...");
        await pull(token);
    } else {
        logDim("set your token, then run: npx @uu-webtools/cli pull");
    }

    logSuccess("done!");
}
