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

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");
    if (membership.role === "Member")
      throw new Error("Only Admins and Managers can update projects");

    await ctx.db.patch(args.projectId, {
      name: args.name,
      description: args.description,
      image: args.image,
    });
  },
});

export const generateApiToken = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership) throw new Error("Not a member");
    if (membership.role === "Member")
      throw new Error("Only Admins and Managers can generate tokens");

    const settings = await ctx.db
      .query("projectSettings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "wt_";
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (settings) {
      await ctx.db.patch(settings._id, { apiKey: token });
    } else {
      await ctx.db.insert("projectSettings", {
        projectId: args.projectId,
        supportedLanguages: [],
        apiKey: token,
      });
    }

    return token;
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
