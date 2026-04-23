import { defineSchema } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { orgTables } from "./organization";
import { projectTables } from "./schemes/project";
import { translationsTables } from "./schemes/translations";
import { projectSettingsTables } from "./schemes/projectSettings";
import { notificationTables } from "./schemes/notifications";
import { errorsTables } from "./schemes/errors";
import { listsTables } from "./schemes/lists";

export default defineSchema({
  ...authTables,
  ...orgTables,
  ...projectTables,
  ...translationsTables,
  ...projectSettingsTables,
  ...notificationTables,
  ...errorsTables,
  ...listsTables,
});
