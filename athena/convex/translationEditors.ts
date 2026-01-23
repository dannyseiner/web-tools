import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const startEditing = mutation({
  args: {
    translationId: v.id("translations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const staleThreshold = Date.now() - 30000;
    const staleEditors = await ctx.db
      .query("activeTranslationEditors")
      .withIndex("by_lastActive")
      .filter((q) => q.lt(q.field("lastActive"), staleThreshold))
      .collect();

    for (const editor of staleEditors) {
      await ctx.db.delete(editor._id);
    }

    const existing = await ctx.db
      .query("activeTranslationEditors")
      .withIndex("by_translation", (q) =>
        q.eq("translationId", args.translationId),
      )
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastActive: Date.now() });
    } else {
      await ctx.db.insert("activeTranslationEditors", {
        translationId: args.translationId,
        userId,
        lastActive: Date.now(),
      });
    }

    return null;
  },
});

export const stopEditing = mutation({
  args: {
    translationId: v.id("translations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const editors = await ctx.db
      .query("activeTranslationEditors")
      .withIndex("by_translation", (q) =>
        q.eq("translationId", args.translationId),
      )
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    for (const editor of editors) {
      await ctx.db.delete(editor._id);
    }

    return null;
  },
});

export const getActiveEditors = query({
  args: {
    projectId: v.id("projects"),
    languageCode: v.string(),
  },
  returns: v.array(
    v.object({
      translationId: v.id("translations"),
      userId: v.id("users"),
      userName: v.union(v.string(), v.null()),
      userEmail: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const translations = await ctx.db
      .query("translations")
      .withIndex("by_project_and_language", (q) =>
        q.eq("projectId", args.projectId).eq("languageCode", args.languageCode),
      )
      .collect();

    const translationIds = translations.map((t) => t._id);

    const staleThreshold = Date.now() - 30000;
    const allEditors = await ctx.db
      .query("activeTranslationEditors")
      .withIndex("by_lastActive")
      .filter((q) => q.gte(q.field("lastActive"), staleThreshold))
      .collect();

    const relevantEditors = allEditors.filter(
      (e) => translationIds.includes(e.translationId) && e.userId !== userId,
    );

    const result = await Promise.all(
      relevantEditors.map(async (editor) => {
        const user = await ctx.db.get(editor.userId);
        return {
          translationId: editor.translationId,
          userId: editor.userId,
          userName: user?.name ?? null,
          userEmail: user?.email ?? null,
        };
      }),
    );

    return result;
  },
});
