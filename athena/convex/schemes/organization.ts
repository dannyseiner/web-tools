import { defineTable } from "convex/server";
import { v } from "convex/values";

export const orgTables = {
  organizations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    createdBy: v.id("users"),
  }).index("by_createdBy", ["createdBy"]),

  organizationMembers: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(
      v.literal("Member"),
      v.literal("Manager"),
      v.literal("Admin"),
    ),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_userId", ["userId"])
    .index("by_organizationId_and_userId", ["organizationId", "userId"]),

  subscriptions: defineTable({
    organizationId: v.id("organizations"),
    subscriptionType: v.union(
      v.literal("Basic"),
      v.literal("Pro"),
      v.literal("Enterprise"),
    ),
  }).index("by_organizationId", ["organizationId"]),
};
