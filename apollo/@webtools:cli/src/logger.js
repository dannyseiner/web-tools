export const RESET = "\x1b[0m";
export const BOLD = "\x1b[1m";
export const DIM = "\x1b[2m";
export const RED = "\x1b[31m";
export const GREEN = "\x1b[32m";
export const YELLOW = "\x1b[33m";
export const CYAN = "\x1b[36m";
export const ORANGE = "\x1b[38;5;208m";

const PREFIX = `${ORANGE}${BOLD}webtools${RESET}`;

export function log(msg) {
    console.log(`  ${PREFIX} ${msg}`);
}

export function logSuccess(msg) {
    console.log(`  ${PREFIX} ${GREEN}${msg}${RESET}`);
}

export function logDim(msg) {
    console.log(`  ${PREFIX} ${DIM}${msg}${RESET}`);
}

export function logError(msg) {
    console.error(`  ${PREFIX} ${RED}${msg}${RESET}`);
}

export function logWarn(msg) {
    console.log(`  ${PREFIX} ${YELLOW}${msg}${RESET}`);
}
