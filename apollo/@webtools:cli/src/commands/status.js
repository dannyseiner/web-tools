import { log, logDim, logWarn } from "../logger.js";
import { get } from "../api.js";

function flatCount(obj, prefix = "") {
    const result = {};
    for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object" && !Array.isArray(v)) {
            Object.assign(result, flatCount(v, key));
        } else {
            result[key] = v;
        }
    }
    return result;
}

export async function status(token) {
    log("checking project status...");

    const [translations, languages] = await Promise.all([
        get("/i18n/translations", token),
        get("/i18n/languages", token),
    ]);

    const translationLangs = Object.keys(translations);

    log(`languages: ${languages.length}`);
    for (const lang of languages) {
        const keys = translations[lang.code]
            ? Object.keys(flatCount(translations[lang.code]))
            : 0;
        logDim(`  ${lang.code} (${lang.nativeName}) — ${keys} keys`);
    }

    const missingLangs = languages
        .filter((l) => !translationLangs.includes(l.code))
        .map((l) => l.code);

    if (missingLangs.length > 0) {
        logWarn(`languages with no translations: ${missingLangs.join(", ")}`);
    }
}
