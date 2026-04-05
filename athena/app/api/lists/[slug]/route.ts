import { api } from "@/convex/_generated/api";
import { withAuth } from "@/modules/api/utils/project";
import {
  corsPreflightResponse,
  withCorsHeaders,
} from "@/modules/api/utils/cors";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function OPTIONS() {
  return corsPreflightResponse();
}

export const GET = withAuth(async (request, project) => {
  const url = new URL(request.url);
  const slug = url.pathname.split("/").pop();

  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug" }), {
      status: 400,
      headers: withCorsHeaders({ "Content-Type": "application/json" }),
    });
  }

  const list = await convex.query(api.lists.getBySlug, {
    projectId: project.projectId,
    slug,
  });

  if (!list) {
    return new Response(JSON.stringify({ error: "List not found" }), {
      status: 404,
      headers: withCorsHeaders({ "Content-Type": "application/json" }),
    });
  }

  return new Response(JSON.stringify(list), {
    status: 200,
    headers: withCorsHeaders({ "Content-Type": "application/json" }),
  });
});
