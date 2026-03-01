import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { NOTIFICATION_TYPES } from "./schemes/notifications";

export const reportError = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    message: v.string(),
    stack: v.optional(v.string()),
    url: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.string(),
    app: v.optional(v.string()),
    env: v.optional(v.string()),
    release: v.optional(v.string()),
    tagsJson: v.optional(v.string()),
    extraJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return;

    await ctx.db.insert("reportedErrors", {
      projectId: args.projectId,
      name: args.name,
      message: args.message,
      stack: args.stack,
      url: args.url,
      userAgent: args.userAgent,
      timestamp: args.timestamp,
      app: args.app,
      env: args.env,
      release: args.release,
      tagsJson: args.tagsJson,
      extraJson: args.extraJson,
    });

    await ctx.db.insert("notifications", {
      organizationId: project.organizationId,
      type: NOTIFICATION_TYPES.PROJECT_ERROR,
      data: JSON.stringify({
        message: args.message,
        projectName: project.name,
      }),
      read: false,
    });
  },
});

export const getReportedErrors = query({
  args: {
    projectId: v.id("projects"),
    search: v.optional(v.string()),
    errorName: v.optional(v.string()),
    fromTimestamp: v.optional(v.string()),
    toTimestamp: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const project = await ctx.db.get(args.projectId);
    if (!project) return [];

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", project.organizationId).eq("userId", userId),
      )
      .first();
    if (!membership) return [];

    let errors = await ctx.db
      .query("reportedErrors")
      .withIndex("by_project_and_timestamp", (q) =>
        q.eq("projectId", args.projectId),
      )
      .order("desc")
      .take(args.limit ?? 100);

    const searchLower = args.search?.toLowerCase().trim();
    if (searchLower) {
      errors = errors.filter(
        (e) =>
          e.message.toLowerCase().includes(searchLower) ||
          e.name.toLowerCase().includes(searchLower),
      );
    }
    if (args.errorName) {
      errors = errors.filter((e) => e.name === args.errorName);
    }
    if (args.fromTimestamp) {
      errors = errors.filter((e) => e.timestamp >= args.fromTimestamp!);
    }
    if (args.toTimestamp) {
      errors = errors.filter((e) => e.timestamp <= args.toTimestamp!);
    }

    return errors;
  },
});
