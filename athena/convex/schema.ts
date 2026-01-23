import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { orgTables } from "./organization";
import { projectTables } from "./schemes/project";
import { translationsTables } from "./schemes/translations";
import { projectSettingsTables } from "./schemes/projectSettings";

export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  ...orgTables,
  ...projectTables,
  ...translationsTables,
  ...projectSettingsTables,
});
