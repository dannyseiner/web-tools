import { withAuth } from "@/modules/api/utils/project";

export const POST = withAuth(async (request, project) => {
  console.log("project", project);
  const body = await request.json();
  console.log("body", body);
  return new Response("OK", { status: 200 });
});
