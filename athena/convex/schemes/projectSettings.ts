import { defineTable } from "convex/server";
import { v } from "convex/values";

export const projectSettingsTables = {
  projectSettings: defineTable({
    projectId: v.id("projects"),
    defaultLanguage: v.optional(v.string()),
    supportedLanguages: v.array(v.string()),
    apiKey: v.optional(v.string()),
  }).index("by_project", ["projectId"]),

  activeTranslationEditors: defineTable({
    translationId: v.id("translations"),
    userId: v.id("users"),
    lastActive: v.number(),
  })
    .index("by_translation", ["translationId"])
    .index("by_user", ["userId"])
    .index("by_lastActive", ["lastActive"]),
};
