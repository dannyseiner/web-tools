import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all translations for a project and language
export const getProjectTranslations = query({
  args: {
    projectId: v.id("projects"),
    languageCode: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("translations"),
      _creationTime: v.number(),
      projectId: v.id("projects"),
      languageCode: v.string(),
      key: v.string(),
      value: v.string(),
      namespace: v.optional(v.string()),
      description: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return [];
    }

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) {
      return [];
    }

    const translations = await ctx.db
      .query("translations")
      .withIndex("by_project_and_language", (q) =>
        q.eq("projectId", args.projectId).eq("languageCode", args.languageCode),
      )
      .collect();

    return translations;
  },
});

export const getAllProjectTranslations = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.array(
    v.object({
      _id: v.id("translations"),
      _creationTime: v.number(),
      projectId: v.id("projects"),
      languageCode: v.string(),
      key: v.string(),
      value: v.string(),
      namespace: v.optional(v.string()),
      description: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return [];
    }

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) {
      return [];
    }

    const translations = await ctx.db
      .query("translations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return translations;
  },
});

export const getProjectTranslationsByNamespace = query({
  args: {
    projectId: v.id("projects"),
    namespace: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("translations"),
      _creationTime: v.number(),
      projectId: v.id("projects"),
      languageCode: v.string(),
      key: v.string(),
      value: v.string(),
      namespace: v.optional(v.string()),
      description: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return [];
    }

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) {
      return [];
    }

    const translations = await ctx.db
      .query("translations")
      .withIndex("by_project_and_namespace", (q) =>
        q.eq("projectId", args.projectId).eq("namespace", args.namespace),
      )
      .collect();

    return translations;
  },
});

export const upsertTranslation = mutation({
  args: {
    projectId: v.id("projects"),
    languageCode: v.string(),
    key: v.string(),
    value: v.string(),
    namespace: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.id("translations"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) {
      throw new Error("You must be a member of this organization");
    }

    const existing = await ctx.db
      .query("translations")
      .withIndex("by_project_language_and_key", (q) =>
        q
          .eq("projectId", args.projectId)
          .eq("languageCode", args.languageCode)
          .eq("key", args.key),
      )
      .first();

    if (existing) {
      await ctx.db.insert("translationHistory", {
        translationId: existing._id,
        projectId: args.projectId,
        languageCode: args.languageCode,
        key: args.key,
        oldValue: existing.value,
        newValue: args.value,
        changedBy: userId,
      });

      await ctx.db.patch(existing._id, {
        value: args.value,
        namespace: args.namespace,
        description: args.description,
      });

      return existing._id;
    } else {
      const translationId = await ctx.db.insert("translations", {
        projectId: args.projectId,
        languageCode: args.languageCode,
        key: args.key,
        value: args.value,
        namespace: args.namespace,
        description: args.description,
      });

      return translationId;
    }
  },
});

export const bulkUpsertTranslations = mutation({
  args: {
    projectId: v.id("projects"),
    languageCode: v.string(),
    translations: v.array(
      v.object({
        key: v.string(),
        value: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    let created = 0;
    let updated = 0;

    for (const { key, value } of args.translations) {
      const existing = await ctx.db
        .query("translations")
        .withIndex("by_project_language_and_key", (q) =>
          q
            .eq("projectId", args.projectId)
            .eq("languageCode", args.languageCode)
            .eq("key", key),
        )
        .first();

      const parts = key.split(".");
      const namespace = parts.length > 1 ? parts[0] : undefined;

      if (existing) {
        if (existing.value !== value) {
          await ctx.db.patch(existing._id, { value, namespace });
          updated++;
        }
      } else {
        await ctx.db.insert("translations", {
          projectId: args.projectId,
          languageCode: args.languageCode,
          key,
          value,
          namespace,
        });
        created++;
      }
    }

    return { created, updated };
  },
});

export const createMissingTranslation = mutation({
  args: {
    projectId: v.id("projects"),
    languageCode: v.string(),
    key: v.string(),
  },
  returns: v.union(v.id("translations"), v.null()),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("translations")
      .withIndex("by_project_language_and_key", (q) =>
        q
          .eq("projectId", args.projectId)
          .eq("languageCode", args.languageCode)
          .eq("key", args.key),
      )
      .first();

    if (existing) return null;

    const parts = args.key.split(".");
    const namespace = parts.length > 1 ? parts[0] : undefined;

    const translationId = await ctx.db.insert("translations", {
      projectId: args.projectId,
      languageCode: args.languageCode,
      key: args.key,
      value: "",
      namespace,
      description: "Auto-created from missing translation report",
    });

    return translationId;
  },
});

export const deleteTranslation = mutation({
  args: {
    translationId: v.id("translations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const translation = await ctx.db.get(args.translationId);
    if (!translation) {
      throw new Error("Translation not found");
    }

    const project = await ctx.db.get(translation.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) {
      throw new Error("You must be a member of this organization");
    }

    await ctx.db.delete(args.translationId);
    return null;
  },
});

export const getTranslationHistory = query({
  args: {
    translationId: v.id("translations"),
  },
  returns: v.array(
    v.object({
      _id: v.id("translationHistory"),
      _creationTime: v.number(),
      translationId: v.id("translations"),
      projectId: v.id("projects"),
      languageCode: v.string(),
      key: v.string(),
      oldValue: v.string(),
      newValue: v.string(),
      changedBy: v.id("users"),
      changedByUser: v.union(
        v.object({
          name: v.union(v.string(), v.null()),
          email: v.union(v.string(), v.null()),
          image: v.union(v.string(), v.null()),
        }),
        v.null(),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const translation = await ctx.db.get(args.translationId);
    if (!translation) {
      return [];
    }

    const project = await ctx.db.get(translation.projectId);
    if (!project) {
      return [];
    }

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) {
      return [];
    }

    const history = await ctx.db
      .query("translationHistory")
      .withIndex("by_translation", (q) =>
        q.eq("translationId", args.translationId),
      )
      .order("desc")
      .collect();

    return await Promise.all(
      history.map(async (entry) => {
        const user = await ctx.db.get(entry.changedBy);
        return {
          ...entry,
          changedByUser: user
            ? {
                name: user.name ?? null,
                email: user.email ?? null,
                image: user.image ?? null,
              }
            : null,
        };
      }),
    );
  },
});
