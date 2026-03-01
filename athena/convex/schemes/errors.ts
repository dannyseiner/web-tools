import { defineTable } from "convex/server";
import { v } from "convex/values";

export const errorsTables = {
  reportedErrors: defineTable({
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
  })
    .index("by_project", ["projectId"])
    .index("by_project_and_timestamp", ["projectId", "timestamp"]),
};
