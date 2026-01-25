import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get all organizations (public - no auth required)
 * This is useful for public API routes
 */
export const getAllOrganizations = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("organizations"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.union(v.string(), v.null()),
      image: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx) => {
    const organizations = await ctx.db.query("organizations").collect();

    return organizations.map((org) => ({
      _id: org._id,
      _creationTime: org._creationTime,
      name: org.name,
      description: org.description ?? null,
      image: org.image ?? null,
    }));
  },
});

/**
 * Create a new organization and add the creator as an admin
 */
export const createOrganization = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  returns: v.object({
    organizationId: v.id("organizations"),
    memberId: v.id("organizationMembers"),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to create an organization");
    }

    // Validate name
    if (!args.name || args.name.trim().length === 0) {
      throw new Error("Organization name is required");
    }

    if (args.name.length < 2) {
      throw new Error("Organization name must be at least 2 characters");
    }

    if (args.name.length > 100) {
      throw new Error("Organization name must be less than 100 characters");
    }

    // Validate description if provided
    if (args.description && args.description.length > 500) {
      throw new Error(
        "Organization description must be less than 500 characters",
      );
    }

    // Create the organization
    const organizationId = await ctx.db.insert("organizations", {
      name: args.name.trim(),
      description: args.description?.trim(),
      image: args.image,
      createdBy: userId,
    });

    // Add the creator as an admin
    const memberId = await ctx.db.insert("organizationMembers", {
      organizationId,
      userId,
      role: "Admin",
    });

    return { organizationId, memberId };
  },
});

/**
 * Get organizations for the current user
 */
export const getUserOrganizations = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("organizations"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.union(v.string(), v.null()),
      image: v.union(v.string(), v.null()),
      createdBy: v.id("users"),
      role: v.union(
        v.literal("Member"),
        v.literal("Manager"),
        v.literal("Admin"),
      ),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get all organization memberships for the user
    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Get organization details for each membership
    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        if (!org) {
          return null;
        }
        return {
          ...org,
          description: org.description ?? null,
          image: org.image ?? null,
          role: membership.role,
        };
      }),
    );

    // Filter out any null values
    return organizations.filter((org) => org !== null);
  },
});

/**
 * Get organization details by ID
 */
export const getOrganization = query({
  args: {
    organizationId: v.id("organizations"),
  },
  returns: v.union(
    v.object({
      _id: v.id("organizations"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.union(v.string(), v.null()),
      image: v.union(v.string(), v.null()),
      createdBy: v.id("users"),
      userRole: v.union(
        v.union(v.literal("Member"), v.literal("Manager"), v.literal("Admin")),
        v.null(),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const org = await ctx.db.get(args.organizationId);

    if (!org) {
      return null;
    }

    // Get user's role in this organization
    let userRole = null;
    if (userId) {
      const membership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_organizationId_and_userId", (q) =>
          q.eq("organizationId", args.organizationId).eq("userId", userId),
        )
        .first();

      userRole = membership?.role ?? null;
    }

    return {
      ...org,
      description: org.description ?? null,
      image: org.image ?? null,
      userRole,
    };
  },
});

/**
 * Update organization details (Admin only)
 */
export const updateOrganization = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    // Check if user is an admin of this organization
    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId),
      )
      .first();

    if (!membership || membership.role !== "Admin") {
      throw new Error("Only admins can update organization details");
    }

    const updates: Record<string, string | undefined> = {};

    if (args.name !== undefined) {
      if (args.name.trim().length < 2) {
        throw new Error("Organization name must be at least 2 characters");
      }
      if (args.name.length > 100) {
        throw new Error("Organization name must be less than 100 characters");
      }
      updates.name = args.name.trim();
    }

    if (args.description !== undefined) {
      if (args.description.length > 500) {
        throw new Error(
          "Organization description must be less than 500 characters",
        );
      }
      updates.description = args.description.trim();
    }

    if (args.image !== undefined) {
      updates.image = args.image;
    }

    await ctx.db.patch(args.organizationId, updates);
    return null;
  },
});

export const getOrganizationMembers = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId)
      )
      .first();

    if (!membership) return null;

    const members = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          _id: member._id,
          _creationTime: member._creationTime,
          role: member.role,
          user: user
            ? {
                _id: user._id,
                name: user.name ?? "Unknown",
                email: user.email ?? "No email",
                image: user.image ?? null,
              }
            : null,
        };
      })
    );

    return membersWithDetails.filter((m) => m.user !== null);
  },
});

export const updateMemberRole = mutation({
  args: {
    memberId: v.id("organizationMembers"),
    role: v.union(v.literal("Member"), v.literal("Manager"), v.literal("Admin")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member not found");

    const adminMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", member.organizationId).eq("userId", userId)
      )
      .first();

    if (!adminMembership || adminMembership.role !== "Admin") {
      throw new Error("Only admins can change member roles");
    }

    await ctx.db.patch(args.memberId, { role: args.role });
  },
});

export const removeMember = mutation({
  args: {
    memberId: v.id("organizationMembers"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member not found");

    const adminMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organizationId_and_userId", (q) =>
        q.eq("organizationId", member.organizationId).eq("userId", userId)
      )
      .first();

    if (!adminMembership || adminMembership.role !== "Admin") {
      throw new Error("Only admins can remove members");
    }

    if (member.userId === userId) {
      throw new Error("You cannot remove yourself");
    }

    await ctx.db.delete(args.memberId);
  },
});
