const DEFAULT_DSN = "https://web-tools-ashen.vercel.app/api/errors";
// const DEFAULT_DSN = "http://localhost:3000/api/errors";

export type ErrorClientOptions = {
  dsn?: string;
  projectToken?: string;
  app?: string;
  env?: string;
  release?: string;
  tags?: Record<string, string>;
};

export type CaptureExtras = {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
};

let _opts: ErrorClientOptions | null = null;

export function initErrorClient(opts: ErrorClientOptions) {
  const resolvedToken =
    opts.projectToken ?? process.env.NEXT_PUBLIC_WEBTOOLS_PROJECT_TOKEN ?? "";

  if (!resolvedToken) {
    console.error(
      "[@webtools/client] Missing projectToken. Error reporting will not work. " +
        "Set NEXT_PUBLIC_WEBTOOLS_PROJECT_TOKEN in your .env or pass it via NextErrorProvider props.",
    );
  }

  _opts = {
    ...opts,
    projectToken: resolvedToken,
    dsn: opts.dsn ?? DEFAULT_DSN,
  };
}

function safeString(v: unknown) {
  try {
    return typeof v === "string" ? v : JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export async function captureException(err: unknown, extras?: CaptureExtras) {
  if (!_opts) return;

  const e = err instanceof Error ? err : new Error(safeString(err));

  const payload = {
    name: e.name,
    message: e.message,
    stack: e.stack,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString(),
    projectToken: _opts.projectToken,
    app: _opts.app,
    env: _opts.env,
    release: _opts.release,
    tags: { ..._opts.tags, ...extras?.tags },
    extra: extras?.extra,
  };

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (_opts.projectToken) {
      headers["X-Project-Token"] = _opts.projectToken;
    }
    await fetch(DEFAULT_DSN, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {}
}

export function installGlobalHandlers() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    captureException(event.error ?? new Error(event.message), {
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    captureException(event.reason ?? new Error("Unhandled promise rejection"));
  });
}
