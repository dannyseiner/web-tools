import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export type AuthenticatedProject = Doc<"projectSettings">;

export async function authenticate(
  request: Request,
): Promise<Response | AuthenticatedProject> {
  const token = request.headers.get("X-Project-Token");

  if (!token) {
    return new Response("Missing authorization token", { status: 401 });
  }

  const project = await convex.query(api.projects.getProjectByToken, { token });
  if (!project) {
    return new Response("Invalid authorization token", { status: 401 });
  }

  return project;
}

export function withAuth(
  handler: (
    request: Request,
    project: AuthenticatedProject,
  ) => Promise<Response>,
) {
  return async (request: Request): Promise<Response> => {
    const result = await authenticate(request);
    if (result instanceof Response) return result;
    return handler(request, result);
  };
}
