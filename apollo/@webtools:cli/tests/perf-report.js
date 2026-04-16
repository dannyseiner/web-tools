import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "performance-data.jsonl");

export function record(route, payload, durationMs, status = 200, extra = "") {
    const line = JSON.stringify({ route, payload, durationMs, status, extra });
    fs.appendFileSync(DATA_PATH, line + "\n", "utf8");
}
