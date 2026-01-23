import { v } from "convex/values";
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
