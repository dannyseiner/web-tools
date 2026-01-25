import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createNotification = mutation({
  args: {
    userId: v.optional(v.id("users")),
    organizationId: v.optional(v.id("organizations")),
    type: v.string(),
    data: v.string(),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Unauthorized");

    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      organizationId: args.organizationId,
      type: args.type,
      data: args.data,
      read: false,
    });

    return notificationId;
  },
});

export const getUserNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return notifications;
  },
});

export const getOrganizationNotifications = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const member = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId)
      )
      .first();

    if (!member) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .collect();

    return notifications;
  },
});

export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");

    if (notification.userId && notification.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.notificationId, {
      read: true,
    });
  },
});

export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");

    if (notification.userId && notification.userId !== userId) {
      const member = await ctx.db
        .query("organizationMembers")
        .withIndex("by_organizationId_and_userId", (q) =>
          q
            .eq("organizationId", notification.organizationId!)
            .eq("userId", userId)
        )
        .first();

      if (!member || member.role !== "Admin") {
        throw new Error("Unauthorized");
      }
    }

    await ctx.db.delete(args.notificationId);
  },
});
