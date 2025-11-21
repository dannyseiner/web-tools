const pad = (num: number): string => {
  return num.toString().padStart(2, "0");
};

const getTimeStamp = (): string => {
  const now = new Date();
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
};

const getCallerFunctionName = (): string => {
  const err = new Error();
  const stack = err.stack?.split("\n") ?? [];

  const blacklisted = [
    "getCallerFunctionName",
    "baseLog",
    "Object.assign",
    "Object.warn",
    "Object.error",
    "Object.log",
    "Object.success",
    "logger.",
    "log.ts",
  ];

  for (const line of stack) {
    const match = /at\s+([^(]+)\s?\(/g.exec(line);
    if (match?.[1]) {
      if (!blacklisted.some((token) => line.includes(token))) {
        return match[1].trim();
      }
    }
  }

  return "anonymous";
};

type LogLevel = "log" | "warn" | "error" | "success";

/**
 * ANSI codes for background + text color.
 *  - \x1b[44m = Blue Background
 *  - \x1b[43m = Yellow Background
 *  - \x1b[41m = Red Background
 *  - \x1b[42m = Green Background
 *  - \x1b[37m = White Text
 *  - \x1b[30m = Black Text
 *  - \x1b[1m  = Bold
 *  - \x1b[0m  = Reset
 */
const colorMap: Record<LogLevel, string> = {
  log: "\x1b[44m\x1b[1m\x1b[37m", // Blue background, white text
  warn: "\x1b[43m\x1b[1m\x1b[30m", // Yellow background, black text
  error: "\x1b[41m\x1b[1m\x1b[37m", // Red background, white text
  success: "\x1b[42m\x1b[1m\x1b[37m", // Green background, white text
};

const baseLog = (level: LogLevel, ...args: unknown[]): void => {
  const time = getTimeStamp();
  const caller = getCallerFunctionName();

  const color = colorMap[level];
  const reset = "\x1b[0m";

  if (process.env.NEXT_PUBLIC_NODE_ENV?.toLowerCase() === "dev") {
    console.log(`${color}[${time} LOGGER]: (${caller}) >${reset}`, ...args);
  }
};

export const log = Object.assign(
  (...args: unknown[]) => {
    baseLog("log", ...args);
  },
  {
    warn: (...args: unknown[]) => {
      baseLog("warn", ...args);
    },
    error: (...args: unknown[]) => {
      baseLog("error", ...args);
    },
    success: (...args: unknown[]) => {
      baseLog("success", ...args);
    },
  },
);
