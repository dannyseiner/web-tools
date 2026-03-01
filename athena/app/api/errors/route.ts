import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { withAuth } from "@/modules/api/utils/project";
import {
  corsPreflightResponse,
  withCorsHeaders,
} from "@/modules/api/utils/cors";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function withAuthAndCors(
  handler: Parameters<typeof withAuth>[0],
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    const response = await withAuth(handler)(request);
    const body = await response.text().catch(() => "");
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: withCorsHeaders(response.headers),
    });
  };
}

export async function OPTIONS() {
  return corsPreflightResponse();
}

export const POST = withAuthAndCors(async (request, project) => {
  let body: {
    name?: string;
    message?: string;
    stack?: string;
    url?: string;
    userAgent?: string;
    timestamp?: string;
    app?: string;
    env?: string;
    release?: string;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: withCorsHeaders({ "Content-Type": "application/json" }),
    });
  }

  const name = typeof body.name === "string" ? body.name : "Error";
  const message =
    typeof body.message === "string"
      ? body.message
      : String(body.message ?? "Unknown error");

  await convex.mutation(api.errors.reportError, {
    projectId: project.projectId,
    name,
    message,
    stack: typeof body.stack === "string" ? body.stack : undefined,
    url: typeof body.url === "string" ? body.url : undefined,
    userAgent: typeof body.userAgent === "string" ? body.userAgent : undefined,
    timestamp:
      typeof body.timestamp === "string"
        ? body.timestamp
        : new Date().toISOString(),
    app: typeof body.app === "string" ? body.app : undefined,
    env: typeof body.env === "string" ? body.env : undefined,
    release: typeof body.release === "string" ? body.release : undefined,
    tagsJson: body.tags != null ? JSON.stringify(body.tags) : undefined,
    extraJson: body.extra != null ? JSON.stringify(body.extra) : undefined,
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: withCorsHeaders({ "Content-Type": "application/json" }),
  });
});
