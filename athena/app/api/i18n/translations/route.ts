import { api } from "@/convex/_generated/api";
import { withAuth } from "@/modules/api/utils/project";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const GET = withAuth(async (request, project) => {
  const translations = await convex.query(
    api.languages.getProjectTranslations,
    {
      projectId: project.projectId,
    },
  );

  return new Response(JSON.stringify(translations), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
