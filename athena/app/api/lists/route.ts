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
  const lists = await convex.query(api.lists.getByProjectPublic, {
    projectId: project.projectId,
  });

  return new Response(JSON.stringify(lists), {
    status: 200,
    headers: withCorsHeaders({ "Content-Type": "application/json" }),
  });
});
