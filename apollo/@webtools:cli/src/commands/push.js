import path from "path";
import { log, logSuccess, logDim, logError, logWarn } from "../logger.js";
import { post } from "../api.js";
import {
    resolveMessagesDir, readJson, exists,
    listDirs, listJsonFiles, relativePath,
} from "../files.js";

export async function push(token) {
    const messagesDir = resolveMessagesDir();

    if (!exists(messagesDir)) {
        logError(`messages directory not found: ${messagesDir}`);
        logDim("Create your translation files in messages/{lang}/common.json");
        process.exit(1);
    }

    log("pushing translations...");

    const payload = {};
    const langDirNames = listDirs(messagesDir);

    for (const lang of langDirNames) {
        payload[lang] = {};
        const files = listJsonFiles(path.join(messagesDir, lang));

        for (const file of files) {
            const filePath = path.join(messagesDir, lang, file);
            Object.assign(payload[lang], readJson(filePath));
            logDim(`read ${relativePath(filePath)}`);
        }
    }

    const langs = Object.keys(payload);
    if (langs.length === 0) {
        logWarn("no translation files found to push");
        return;
    }

    const result = await post("/i18n/translations", token, payload);

    if (result.results) {
        for (const [lang, stats] of Object.entries(result.results)) {
            logDim(`${lang}: ${stats.created} created, ${stats.updated} updated`);
        }
    }

    logSuccess(`pushed translations for ${langs.length} language(s)`);
}
