import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { NOTIFICATION_TYPES } from "./schemes/notifications";

export const createOrganizationErrorNotification = mutation({
  args: {
    organizationId: v.id("organizations"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    if (!organization) throw new Error("Organization not found");

    await ctx.db.insert("notifications", {
      organizationId: args.organizationId,
      type: NOTIFICATION_TYPES.ORGANIZATION_ERROR,
      data: JSON.stringify({
        message: args.message,
        organizationName: organization.name,
      }),
      read: false,
    });
  },
});

export const createProjectErrorNotification = mutation({
  args: {
    organizationId: v.id("organizations"),
    projectId: v.id("projects"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    await ctx.db.insert("notifications", {
      organizationId: args.organizationId,
      type: NOTIFICATION_TYPES.PROJECT_ERROR,
      data: JSON.stringify({
        message: args.message,
        projectName: project.name,
      }),
      read: false,
    });
  },
});

export const createUserNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    data: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      data: args.data,
      read: false,
    });
  },
});

export const notifyMemberJoined = mutation({
  args: {
    organizationId: v.id("organizations"),
    memberId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    const member = await ctx.db.get(args.memberId);
    
    if (!organization || !member) return;

    await ctx.db.insert("notifications", {
      organizationId: args.organizationId,
      type: NOTIFICATION_TYPES.MEMBER_JOINED,
      data: JSON.stringify({
        memberName: member.name ?? member.email ?? "New member",
        organizationName: organization.name,
      }),
      read: false,
    });
  },
});

export const notifyProjectCreated = mutation({
  args: {
    organizationId: v.id("organizations"),
    projectId: v.id("projects"),
    createdById: v.id("users"),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.organizationId);
    const project = await ctx.db.get(args.projectId);
    const creator = await ctx.db.get(args.createdById);
    
    if (!organization || !project || !creator) return;

    await ctx.db.insert("notifications", {
      organizationId: args.organizationId,
      type: NOTIFICATION_TYPES.PROJECT_CREATED,
      data: JSON.stringify({
        projectName: project.name,
        organizationName: organization.name,
        createdBy: creator.name ?? creator.email ?? "Someone",
      }),
      read: false,
    });
  },
});
