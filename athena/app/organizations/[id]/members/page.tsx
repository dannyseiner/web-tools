"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { exportWithOrganizationLayout } from "@/modules/core/layouts/organization-layout";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Mail,
  Trash2,
  Crown,
  Briefcase,
  Loader2,
  User,
  ArrowLeft,
  Shield,
  UserCog,
} from "lucide-react";
import { motion } from "motion/react";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { InviteModal } from "@/modules/organizations/components/invite-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/ui/select";
import { useTranslations } from "next-intl";

function OrganizationMembersPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const organizationId = params.id as Id<"organizations">;
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const organization = useQuery(api.organizations.getOrganization, {
    organizationId,
  });

  const currentUser = useQuery(api.profile.getProfile);

  const members = useQuery(api.organizations.getOrganizationMembers, {
    organizationId,
  });

  const invites = useQuery(api.invitations.getOrganizationInvites, {
    organizationId,
  });

  const updateMemberRole = useMutation(api.organizations.updateMemberRole);
  const removeMember = useMutation(api.organizations.removeMember);
  const deleteInvite = useMutation(api.invitations.deleteInvite);

  const isAdmin = organization?.userRole === "Admin";
  const canInvite =
    organization?.userRole === "Admin" || organization?.userRole === "Manager";

  const handleRoleChange = async (
    memberId: Id<"organizationMembers">,
    role: "Member" | "Manager" | "Admin"
  ) => {
    try {
      await updateMemberRole({ memberId, role });
    } catch (err) {
      console.error("Failed to update role", err);
    }
  };

  const handleRemoveMember = async (memberId: Id<"organizationMembers">) => {
    if (!confirm(t("pages.members.confirmRemove"))) return;
    try {
      await removeMember({ memberId });
    } catch (err) {
      console.error("Failed to remove member", err);
    }
  };

  const handleDeleteInvite = async (inviteId: Id<"organizationInvites">) => {
    try {
      await deleteInvite({ inviteId });
    } catch (err) {
      console.error("Failed to delete invite", err);
    }
  };

  const getRoleIcon = (role: "Member" | "Manager" | "Admin") => {
    switch (role) {
      case "Admin":
        return <Crown className="h-4 w-4 text-primary" />;
      case "Manager":
        return <Briefcase className="h-4 w-4 text-orange-500" />;
      case "Member":
        return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeClass = (role: "Member" | "Manager" | "Admin") => {
    switch (role) {
      case "Admin":
        return "bg-primary/10 text-primary border-primary/20";
      case "Manager":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      case "Member":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusBadge = (status: "pending" | "accepted" | "rejected") => {
    const styles = {
      pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      accepted: "bg-green-500/10 text-green-600 dark:text-green-400",
      rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
    };
    return styles[status];
  };

  if (organization === undefined || members === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t("pages.members.loadingMembers")}</p>
        </div>
      </div>
    );
  }

  if (organization === null || members === null) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t("pages.members.accessDenied")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("pages.members.accessDeniedDesc")}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/organizations")}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            {t("pages.members.backToOrganization")}
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push(`/organizations/${organizationId}`)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        {t("pages.members.backToOrganization")}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shrink-0">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
              {t("pages.members.title")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground truncate">
              {t("pages.members.subtitle", { organizationName: organization.name })}
            </p>
          </div>
        </div>
        {canInvite && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
          >
            <Mail className="h-5 w-5" />
            {t("pages.members.inviteMembers")}
          </motion.button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-4 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
              {t("pages.members.activeMembers", { count: members.length })}
            </h2>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("pages.members.noMembersYet")}
            </h3>
            <p className="text-muted-foreground">
              {t("pages.members.noMembersDesc")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {member.user?.image ? (
                    <Image
                      src={member.user.image}
                      alt={member.user.name}
                      width={48}
                      height={48}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-border shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {member.user?.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("pages.members.joined")}{" "}
                      {new Date(member._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 justify-end shrink-0">
                  {isAdmin && member.user?._id !== currentUser?._id ? (
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        handleRoleChange(
                          member._id,
                          value as "Member" | "Manager" | "Admin"
                        )
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Member">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {t("pages.members.role.member")}
                          </div>
                        </SelectItem>
                        <SelectItem value="Manager">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {t("pages.members.role.manager")}
                          </div>
                        </SelectItem>
                        <SelectItem value="Admin">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4" />
                            {t("pages.members.role.admin")}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div
                      className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border text-xs sm:text-sm font-medium whitespace-nowrap ${getRoleBadgeClass(member.role)}`}
                    >
                      {getRoleIcon(member.role)}
                      <span>{member.role}</span>
                    </div>
                  )}

                  {isAdmin && member.user?._id !== currentUser?._id && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveMember(member._id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      title={t("pages.members.removeMember")}
                    >
                      <Trash2 className="h-5 w-5" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {canInvite && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <UserCog className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">
              {t("components.employeesSection.pendingInvitations")}
            </h2>
          </div>

          {invites === undefined ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : invites === null || invites.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground">{t("components.employeesSection.noPendingInvitations")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invites.map((invite) => (
                <motion.div
                  key={invite._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("components.employeesSection.invitedOn")}{" "}
                        {new Date(invite._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-end shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadge(invite.status)}`}
                    >
                      {t(`components.employeesSection.status.${invite.status}`)}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteInvite(invite._id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <InviteModal
        organizationId={organizationId}
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />
    </div>
  );
}

export default exportWithOrganizationLayout(OrganizationMembersPage);
