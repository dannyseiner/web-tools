import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createProject = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    defaultLanguage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) {
      throw new Error("You must be a member of this organization");
    }

    if (membership.role === "Member") {
      throw new Error("Only Admins and Managers can create projects");
    }

    const projectId = await ctx.db.insert("projects", {
      organizationId: args.organizationId,
      name: args.name,
      description: args.description,
      image: args.image,
      createdBy: userId,
    });

    await ctx.db.insert("projectSettings", {
      projectId,
      defaultLanguage: args.defaultLanguage,
      supportedLanguages: args.defaultLanguage ? [args.defaultLanguage] : [],
    });

    return projectId;
  },
});

export const getOrganizationProjects = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) {
      return null;
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .collect();

    return projects;
  },
});

export const getProject = query({
  args: {
    projectId: v.id("projects"),
  },
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

    return project;
  },
});

export const getProjectByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query("projectSettings")
      .filter((q) => q.eq(q.field("apiKey"), args.token))
      .first();
    if (!project) {
      return null;
    }

    return project;
  },
});
