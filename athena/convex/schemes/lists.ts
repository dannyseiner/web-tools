import { defineTable } from "convex/server";
import { v } from "convex/values";

export const listsTables = {
  lists: defineTable({
    projectId: v.id("projects"),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    fields: v.array(
      v.object({
        name: v.string(),
        label: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("number"),
          v.literal("boolean"),
          v.literal("date"),
          v.literal("select"),
          v.literal("url"),
          v.literal("richtext"),
        ),
        required: v.boolean(),
        options: v.optional(v.array(v.string())),
        defaultValue: v.optional(v.string()),
      }),
    ),
    slug: v.string(),
    createdBy: v.id("users"),
  })
    .index("by_projectId", ["projectId"])
    .index("by_createdBy", ["createdBy"])
    .index("by_projectId_and_slug", ["projectId", "slug"]),

  listItems: defineTable({
    listId: v.id("lists"),
    projectId: v.id("projects"),
    values: v.any(),
    order: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_listId", ["listId"])
    .index("by_projectId", ["projectId"])
    .index("by_listId_and_order", ["listId", "order"]),
};
