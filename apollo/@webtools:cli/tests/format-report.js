#!/usr/bin/env node


import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "performance-data.jsonl");
const REPORT_PATH = path.join(__dirname, "performance-report.txt");

if (!fs.existsSync(DATA_PATH)) {
    console.log("No performance data found. Run the tests first.");
    process.exit(0);
}

const lines = fs
    .readFileSync(DATA_PATH, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean);

const rows = lines.map((l) => JSON.parse(l));

if (rows.length === 0) {
    console.log("No measurements recorded.");
    process.exit(0);
}

const now = new Date();
const date = now.toISOString().replace("T", " ").slice(0, 19);

const routeW = Math.max(35, ...rows.map((r) => r.route.length));
const payloadW = Math.max(30, ...rows.map((r) => r.payload.length));

const sep = "=".repeat(routeW + payloadW + 45);

const header = [
    sep,
    `  Performance Report — ${date}`,
    sep,
    "",
    [
        "Route".padEnd(routeW),
        "Payload / context".padEnd(payloadW),
        "Status",
        "Duration",
    ].join("  "),
    ["-".repeat(routeW), "-".repeat(payloadW), "------", "----------"].join(
        "  ",
    ),
];

const body = rows.map((r) => {
    const duration =
        typeof r.durationMs === "number"
            ? `${r.durationMs.toFixed(0)} ms`.padStart(10)
            : `${r.durationMs} ms`.padStart(10);
    const line = [
        r.route.padEnd(routeW),
        r.payload.padEnd(payloadW),
        String(r.status).padEnd(6),
        duration,
    ].join("  ");
    return r.extra ? `${line}  (${r.extra})` : line;
});

const footer = [
    "",
    "-".repeat(routeW + payloadW + 45),
    `Total measurements: ${rows.length}`,
    "",
];

const content = [...header, ...body, ...footer].join("\n");

fs.writeFileSync(REPORT_PATH, content, "utf8");
console.log(`Report written to tests/performance-report.txt (${rows.length} measurements)`);
