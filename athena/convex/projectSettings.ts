import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get project settings
export const getProjectSettings = query({
  args: {
    projectId: v.id("projects"),
  },
  returns: v.union(
    v.object({
      _id: v.id("projectSettings"),
      _creationTime: v.number(),
      projectId: v.id("projects"),
      defaultLanguage: v.optional(v.string()),
      supportedLanguages: v.array(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return null;
    }

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) {
      return null;
    }

    const settings = await ctx.db
      .query("projectSettings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    if (!settings) return null;

    return {
      _id: settings._id,
      _creationTime: settings._creationTime,
      projectId: settings.projectId,
      defaultLanguage: settings.defaultLanguage,
      supportedLanguages: settings.supportedLanguages,
    };
  },
});

export const updateProjectSettings = mutation({
  args: {
    projectId: v.id("projects"),
    defaultLanguage: v.string(),
  },
  returns: v.null(),
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

    if (membership.role === "Member") {
      throw new Error("Only Admins and Managers can update project settings");
    }

    const language = await ctx.db
      .query("languages")
      .withIndex("by_code", (q) => q.eq("code", args.defaultLanguage))
      .first();

    if (!language) {
      throw new Error(`Language '${args.defaultLanguage}' not found`);
    }

    if (!language.isActive) {
      throw new Error(`Language '${args.defaultLanguage}' is not active`);
    }

    const existingSettings = await ctx.db
      .query("projectSettings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    if (existingSettings) {
      const supportedLanguages = existingSettings.supportedLanguages || [];
      if (!supportedLanguages.includes(args.defaultLanguage)) {
        supportedLanguages.push(args.defaultLanguage);
      }

      await ctx.db.patch(existingSettings._id, {
        defaultLanguage: args.defaultLanguage,
        supportedLanguages,
      });
    } else {
      await ctx.db.insert("projectSettings", {
        projectId: args.projectId,
        defaultLanguage: args.defaultLanguage,
        supportedLanguages: [args.defaultLanguage],
      });
    }

    return null;
  },
});

export const addLanguage = mutation({
  args: {
    projectId: v.id("projects"),
    languageCode: v.string(),
  },
  returns: v.null(),
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

    if (membership.role === "Member") {
      throw new Error("Only Admins and Managers can add languages");
    }

    const language = await ctx.db
      .query("languages")
      .withIndex("by_code", (q) => q.eq("code", args.languageCode))
      .first();

    if (!language) {
      throw new Error(`Language '${args.languageCode}' not found`);
    }

    if (!language.isActive) {
      throw new Error(`Language '${args.languageCode}' is not active`);
    }

    const settings = await ctx.db
      .query("projectSettings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    if (!settings) {
      throw new Error("Project settings not found");
    }

    const supportedLanguages = settings.supportedLanguages || [];
    if (supportedLanguages.includes(args.languageCode)) {
      throw new Error("Language already added to project");
    }

    supportedLanguages.push(args.languageCode);

    await ctx.db.patch(settings._id, { supportedLanguages });

    return null;
  },
});
