import { defineTable } from "convex/server";
import { v } from "convex/values";

export const NOTIFICATION_TYPES = {
  ORGANIZATION_INVITE: "ORGANIZATION_INVITE",
  ORGANIZATION_ERROR: "ORGANIZATION_ERROR",
  PROJECT_ERROR: "PROJECT_ERROR",
  SYSTEM_ERROR: "SYSTEM_ERROR",
  MEMBER_JOINED: "MEMBER_JOINED",
  MEMBER_LEFT: "MEMBER_LEFT",
  PROJECT_CREATED: "PROJECT_CREATED",
  PROJECT_DELETED: "PROJECT_DELETED",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export interface NotificationData {
  [NOTIFICATION_TYPES.ORGANIZATION_INVITE]: {
    organizationName: string;
    invitedBy: string;
  };
  [NOTIFICATION_TYPES.ORGANIZATION_ERROR]: {
    message: string;
    organizationName: string;
  };
  [NOTIFICATION_TYPES.PROJECT_ERROR]: {
    message: string;
    projectName: string;
  };
  [NOTIFICATION_TYPES.SYSTEM_ERROR]: {
    message: string;
  };
  [NOTIFICATION_TYPES.MEMBER_JOINED]: {
    memberName: string;
    organizationName: string;
  };
  [NOTIFICATION_TYPES.MEMBER_LEFT]: {
    memberName: string;
    organizationName: string;
  };
  [NOTIFICATION_TYPES.PROJECT_CREATED]: {
    projectName: string;
    organizationName: string;
    createdBy: string;
  };
  [NOTIFICATION_TYPES.PROJECT_DELETED]: {
    projectName: string;
    organizationName: string;
    deletedBy: string;
  };
}

export const notificationTables = {
  organizationInvites: defineTable({
    organizationId: v.id("organizations"),
    email: v.string(),
    invitedBy: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
    ),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_email", ["email"])
    .index("by_organizationId_and_email", ["organizationId", "email"]),

  notifications: defineTable({
    userId: v.optional(v.id("users")),
    organizationId: v.optional(v.id("organizations")),
    type: v.string(),
    data: v.string(),
    read: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_organizationId", ["organizationId"])
    .index("by_userId_and_read", ["userId", "read"])
    .index("by_organizationId_and_read", ["organizationId", "read"]),
};
