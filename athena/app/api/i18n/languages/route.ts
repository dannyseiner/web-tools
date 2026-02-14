import { api } from "@/convex/_generated/api";
import { withAuth } from "@/modules/api/utils/project";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const GET = withAuth(async (request, project) => {
  const languages = await convex.query(api.languages.getProjectLanguages, {
    projectId: project.projectId,
  });

  const responseLanguages = languages.map((lang) => {
    return {
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
    };
  });

  return new Response(JSON.stringify(responseLanguages), { status: 200 });
});
