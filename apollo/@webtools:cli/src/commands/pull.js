import path from "path";
import { log, logSuccess, logDim, logWarn } from "../logger.js";
import { get } from "../api.js";
import { ensureDir, resolveMessagesDir, writeJson, relativePath } from "../files.js";

export async function pull(token) {
    const messagesDir = resolveMessagesDir();

    log("pulling translations...");

    const data = await get("/i18n/translations", token);
    const langs = Object.keys(data);

    if (langs.length === 0) {
        logWarn("no translations found for this project");
        return;
    }

    ensureDir(messagesDir);
    let written = 0;

    for (const lang of langs) {
        const value = data[lang];
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            logWarn(`skipping "${lang}" — unexpected format`);
            continue;
        }

        const langDir = path.join(messagesDir, lang);
        ensureDir(langDir);

        const filePath = path.join(langDir, "common.json");
        writeJson(filePath, value);
        written++;
        logDim(`wrote ${relativePath(filePath)}`);
    }

    logSuccess(`pulled ${written} file(s) for ${langs.length} language(s)`);
}
