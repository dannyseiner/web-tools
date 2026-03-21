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

function flattenObject(
  obj: Record<string, unknown>,
  prefix = "",
): { key: string; value: string }[] {
  const result: { key: string; value: string }[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      result.push(...flattenObject(v as Record<string, unknown>, fullKey));
    } else {
      result.push({ key: fullKey, value: String(v ?? "") });
    }
  }
  return result;
}

export const POST = withAuth(async (request, project) => {
  let body: Record<string, Record<string, unknown>>;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return new Response(
      JSON.stringify({
        error: 'Expected object like { "cs": { ... }, "en": { ... } }',
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const results: Record<string, { created: number; updated: number }> = {};

  for (const [languageCode, translations] of Object.entries(body)) {
    if (!translations || typeof translations !== "object" || Array.isArray(translations)) {
      continue;
    }

    const flat = flattenObject(translations as Record<string, unknown>);

    const BATCH_SIZE = 100;
    let created = 0;
    let updated = 0;

    for (let i = 0; i < flat.length; i += BATCH_SIZE) {
      const batch = flat.slice(i, i + BATCH_SIZE);
      const result = await convex.mutation(
        api.translations.bulkUpsertTranslations,
        {
          projectId: project.projectId,
          languageCode,
          translations: batch,
        },
      );
      created += result.created;
      updated += result.updated;
    }

    results[languageCode] = { created, updated };
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
