import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { NOTIFICATION_TYPES } from "./schemes/notifications";

export const sendInvites = mutation({
  args: {
    organizationId: v.id("organizations"),
    emails: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const member = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId)
      )
      .first();

    if (!member || member.role !== "Admin") {
      throw new Error("Only admins can send invites");
    }

    const organization = await ctx.db.get(args.organizationId);
    const inviter = await ctx.db.get(userId);

    const inviteIds = [];
    for (const email of args.emails) {
      const existing = await ctx.db
        .query("organizationInvites")
        .withIndex("by_organizationId_and_email", (q) =>
          q.eq("organizationId", args.organizationId).eq("email", email)
        )
        .filter((q) => q.eq(q.field("status"), "pending"))
        .first();

      if (!existing) {
        const inviteId = await ctx.db.insert("organizationInvites", {
          organizationId: args.organizationId,
          email,
          invitedBy: userId,
          status: "pending",
        });
        inviteIds.push(inviteId);

        const invitedUser = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), email))
          .first();

        if (invitedUser && organization && inviter) {
          await ctx.db.insert("notifications", {
            userId: invitedUser._id,
            organizationId: args.organizationId,
            type: NOTIFICATION_TYPES.ORGANIZATION_INVITE,
            data: JSON.stringify({
              organizationName: organization.name,
              invitedBy: inviter.name ?? inviter.email ?? "Someone",
            }),
            read: false,
          });
        }
      }
    }

    return inviteIds;
  },
});

export const getOrganizationInvites = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const member = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId)
      )
      .first();

    if (!member || member.role !== "Admin") {
      return null;
    }

    const invites = await ctx.db
      .query("organizationInvites")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    return invites;
  },
});

export const deleteInvite = mutation({
  args: {
    inviteId: v.id("organizationInvites"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");

    const member = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", invite.organizationId).eq("userId", userId)
      )
      .first();

    if (!member || member.role !== "Admin") {
      throw new Error("Only admins can delete invites");
    }

    await ctx.db.delete(args.inviteId);
  },
});

export const getMyInvites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user || !user.email) return [];

    const userEmail = user.email;

    const invites = await ctx.db
      .query("organizationInvites")
      .withIndex("by_email", (q) => q.eq("email", userEmail))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const invitesWithDetails = await Promise.all(
      invites.map(async (invite) => {
        const organization = await ctx.db.get(invite.organizationId);
        const inviter = await ctx.db.get(invite.invitedBy);
        return {
          _id: invite._id,
          _creationTime: invite._creationTime,
          organization: organization
            ? {
                _id: organization._id,
                name: organization.name,
                description: organization.description ?? null,
                image: organization.image ?? null,
              }
            : null,
          inviter: inviter
            ? {
                name: inviter.name ?? "Unknown",
                email: inviter.email ?? null,
                image: inviter.image ?? null,
              }
            : null,
        };
      })
    );

    return invitesWithDetails.filter((i) => i.organization !== null);
  },
});

export const acceptInvite = mutation({
  args: {
    inviteId: v.id("organizationInvites"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user || !user.email) throw new Error("User email not found");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");

    if (invite.email !== user.email) {
      throw new Error("This invite is not for you");
    }

    if (invite.status !== "pending") {
      throw new Error("This invite has already been processed");
    }

    const existingMember = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", invite.organizationId).eq("userId", userId)
      )
      .first();

    if (existingMember) {
      await ctx.db.delete(args.inviteId);
      throw new Error("You are already a member of this organization");
    }

    await ctx.db.insert("organizationMembers", {
      organizationId: invite.organizationId,
      userId,
      role: "Member",
    });

    await ctx.db.patch(args.inviteId, { status: "accepted" });
    await ctx.db.delete(args.inviteId);

    const organization = await ctx.db.get(invite.organizationId);
    if (organization && user) {
      await ctx.db.insert("notifications", {
        organizationId: invite.organizationId,
        type: NOTIFICATION_TYPES.MEMBER_JOINED,
        data: JSON.stringify({
          memberName: user.name ?? user.email ?? "New member",
          organizationName: organization.name,
        }),
        read: false,
      });
    }
  },
});

export const declineInvite = mutation({
  args: {
    inviteId: v.id("organizationInvites"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user || !user.email) throw new Error("User email not found");

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");

    if (invite.email !== user.email) {
      throw new Error("This invite is not for you");
    }

    await ctx.db.delete(args.inviteId);
  },
});
