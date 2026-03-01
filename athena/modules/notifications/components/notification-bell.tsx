"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bell, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations } from "next-intl";

interface NotificationBellProps {
  visible?: boolean;
  organizationId?: string;
}

export function NotificationBell({ visible = true, organizationId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations();
  const userNotifications = useQuery(api.notifications.getUserNotifications);
  const orgNotifications = useQuery(
    api.notifications.getOrganizationNotifications,
    organizationId ? { organizationId: organizationId as Id<"organizations"> } : "skip",
  );
  const markAsRead = useMutation(api.notifications.markAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  const notifications = useMemo(() => {
    const user = userNotifications ?? [];
    const org = orgNotifications ?? [];
    const byId = new Map<string, (typeof user)[number]>();
    for (const n of user) byId.set(n._id, n);
    for (const n of org) if (!byId.has(n._id)) byId.set(n._id, n);
    return Array.from(byId.values()).sort(
      (a, b) => b._creationTime - a._creationTime,
    );
  }, [userNotifications, orgNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isLoading =
    userNotifications === undefined ||
    (organizationId && orgNotifications === undefined);

  if (!visible) return null;

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId });
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleDelete = async (notificationId: Id<"notifications">) => {
    try {
      await deleteNotification({ notificationId });
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const parseNotificationData = (type: string, dataStr: string) => {
    try {
      const data = JSON.parse(dataStr);
      switch (type) {
        case "ORGANIZATION_INVITE":
          return t("components.notifications.types.organizationInvite", { 
            organizationName: data.organizationName, 
            invitedBy: data.invitedBy 
          });
        case "ORGANIZATION_ERROR":
          return t("components.notifications.types.organizationError", { 
            organizationName: data.organizationName, 
            message: data.message 
          });
        case "PROJECT_ERROR":
          return t("components.notifications.types.projectError", { 
            projectName: data.projectName, 
            message: data.message 
          });
        case "SYSTEM_ERROR":
          return t("components.notifications.types.systemError", { message: data.message });
        case "MEMBER_JOINED":
          return t("components.notifications.types.memberJoined", { 
            memberName: data.memberName, 
            organizationName: data.organizationName 
          });
        case "MEMBER_LEFT":
          return t("components.notifications.types.memberLeft", { 
            memberName: data.memberName, 
            organizationName: data.organizationName 
          });
        case "PROJECT_CREATED":
          return t("components.notifications.types.projectCreated", { 
            createdBy: data.createdBy, 
            projectName: data.projectName, 
            organizationName: data.organizationName 
          });
        case "PROJECT_DELETED":
          return t("components.notifications.types.projectDeleted", { 
            deletedBy: data.deletedBy, 
            projectName: data.projectName, 
            organizationName: data.organizationName 
          });
        default:
          return t("components.notifications.types.default");
      }
    } catch {
      return t("components.notifications.types.default");
    }
  };

  const getNotificationLabel = () => {
    if (unreadCount === 0) return t("components.notifications.noNewNotifications");
    if (unreadCount > 9) return `9+ ${t("components.notifications.notificationsPlural")}`;
    return `${unreadCount} ${unreadCount === 1 ? t("components.notifications.notification") : t("components.notifications.notificationsPlural")}`;
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-accent transition-colors group"
        title={getNotificationLabel()}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
            >
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{t("components.notifications.title")}</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {getNotificationLabel()}
                    </span>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {t("components.notifications.noNotifications")}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-accent/50 transition-colors ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            if (!notification.read) {
                              handleMarkAsRead(notification._id);
                            }
                          }}
                        >
                          <p className="text-sm">
                            {parseNotificationData(
                              notification.type,
                              notification.data
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(
                              notification._creationTime
                            ).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
