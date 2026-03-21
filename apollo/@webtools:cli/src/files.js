import fs from "fs";
import path from "path";

export function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

export function resolveMessagesDir() {
    return path.resolve(process.cwd(), "messages");
}

export function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function exists(filePath) {
    return fs.existsSync(filePath);
}

export function readText(filePath) {
    return fs.readFileSync(filePath, "utf8");
}

export function writeText(filePath, content) {
    fs.writeFileSync(filePath, content, "utf8");
}

export function appendText(filePath, content) {
    fs.appendFileSync(filePath, content);
}

export function listDirs(dirPath) {
    return fs.readdirSync(dirPath, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name);
}

export function listJsonFiles(dirPath) {
    return fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));
}

export function relativePath(filePath) {
    return path.relative(process.cwd(), filePath);
}
