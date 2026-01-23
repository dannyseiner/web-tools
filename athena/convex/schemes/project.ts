import { defineTable } from "convex/server";
import { v } from "convex/values";

export const projectTables = {
  projects: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    createdBy: v.id("users"),
  }).index("by_organizationId", ["organizationId"]),
  
  projectSettings: defineTable({
    projectId: v.id("projects"),
    defaultLanguage: v.optional(v.string()), // "cs" @default: undefined
  }).index("by_project", ["projectId"]),
};
