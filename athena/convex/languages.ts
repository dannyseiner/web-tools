import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getActiveLanguages = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("languages"),
      _creationTime: v.number(),
      name: v.string(),
      code: v.string(),
      nativeName: v.string(),
      isActive: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const languages = await ctx.db
      .query("languages")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return languages;
  },
});

export const getAllLanguages = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("languages"),
      _creationTime: v.number(),
      name: v.string(),
      code: v.string(),
      nativeName: v.string(),
      isActive: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const languages = await ctx.db.query("languages").collect();
    return languages;
  },
});

export const getLanguageByCode = query({
  args: {
    code: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("languages"),
      _creationTime: v.number(),
      name: v.string(),
      code: v.string(),
      nativeName: v.string(),
      isActive: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const language = await ctx.db
      .query("languages")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    return language;
  },
});

export const createLanguage = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    nativeName: v.string(),
    isActive: v.boolean(),
  },
  returns: v.id("languages"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const existing = await ctx.db
      .query("languages")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (existing) {
      throw new Error(`Language with code '${args.code}' already exists`);
    }

    const languageId = await ctx.db.insert("languages", {
      name: args.name,
      code: args.code,
      nativeName: args.nativeName,
      isActive: args.isActive,
    });

    return languageId;
  },
});

export const updateLanguage = mutation({
  args: {
    languageId: v.id("languages"),
    name: v.optional(v.string()),
    nativeName: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const { languageId, ...updates } = args;

    const language = await ctx.db.get(languageId);
    if (!language) {
      throw new Error("Language not found");
    }

    await ctx.db.patch(languageId, updates);
    return null;
  },
});

export const getProjectLanguages = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(
    v.object({
      _id: v.id("languages"),
      _creationTime: v.number(),
      name: v.string(),
      code: v.string(),
      nativeName: v.string(),
      isActive: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("projectSettings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    if (!settings?.supportedLanguages?.length) {
      return [];
    }

    const result: Doc<"languages">[] = [];
    for (const code of settings.supportedLanguages) {
      const lang = await ctx.db
        .query("languages")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      if (lang) {
        result.push(lang);
      }
    }

    return result;
  },
});

function setNested(
  obj: Record<string, unknown>,
  path: string,
  value: string,
): void {
  const parts = path.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (
      !(part in current) ||
      typeof current[part] !== "object" ||
      current[part] === null
    ) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

export const getProjectTranslations = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.record(v.string(), v.any()),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("translations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const byLanguage: Record<string, Record<string, unknown>> = {};

    for (const row of rows) {
      const { languageCode, key, value } = row;
      if (!byLanguage[languageCode]) {
        byLanguage[languageCode] = {};
      }
      setNested(byLanguage[languageCode], key, value);
    }

    return byLanguage;
  },
});
