import { Doc } from "@/convex/_generated/dataModel";

export type Translation = Doc<"translations">;

export function searchTranslations(
  translations: Translation[],
  searchQuery: string,
): Translation[] {
  if (!searchQuery.trim()) {
    return translations;
  }

  const query = searchQuery.toLowerCase();

  return translations.filter((translation) => {
    const keyMatch = translation.key.toLowerCase().includes(query);
    const valueMatch = translation.value.toLowerCase().includes(query);
    const descriptionMatch =
      translation.description?.toLowerCase().includes(query) ?? false;
    const namespaceMatch =
      translation.namespace?.toLowerCase().includes(query) ?? false;

    return keyMatch || valueMatch || descriptionMatch || namespaceMatch;
  });
}

export function groupByNamespace(
  translations: Translation[],
): Record<string, Translation[]> {
  const grouped: Record<string, Translation[]> = {};

  for (const translation of translations) {
    const namespace = translation.namespace || "general";
    if (!grouped[namespace]) {
      grouped[namespace] = [];
    }
    grouped[namespace].push(translation);
  }

  return grouped;
}
