import { defineTable } from "convex/server";
import { v } from "convex/values";

export const translationsTables = {
  languages: defineTable({
    name: v.string(), // "czech"
    code: v.string(), // "cs"
    nativeName: v.string(), // "Čeština"
    isActive: v.boolean(),
  }).index("by_code", ["code"]),

  translations: defineTable({
    projectId: v.id("projects"),
    languageCode: v.string(), // e.g., "cs", "en"
    key: v.string(), // "auth.welcome"
    value: v.string(), // The actual translated text
    namespace: v.optional(v.string()), // "auth"
    description: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_project_and_language", ["projectId", "languageCode"])
    .index("by_project_language_and_key", ["projectId", "languageCode", "key"])
    .index("by_project_and_namespace", ["projectId", "namespace"]),

  translationHistory: defineTable({
    translationId: v.id("translations"),
    projectId: v.id("projects"),
    languageCode: v.string(),
    key: v.string(),
    oldValue: v.string(),
    newValue: v.string(),
    changedBy: v.id("users"),
  })
    .index("by_translation", ["translationId"])
    .index("by_project", ["projectId"]),
};
