"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { InviteModal } from "./invite-modal";
import { Users, Mail, Trash2, Crown, Briefcase, Loader2, User, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface EmployeesSectionProps {
  organizationId: Id<"organizations">;
  isAdmin: boolean;
}

export function EmployeesSection({
  organizationId,
  isAdmin,
}: EmployeesSectionProps) {
  const router = useRouter();
  const t = useTranslations();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const members = useQuery(api.organizations.getOrganizationMembers, {
    organizationId,
  });

  const invites = useQuery(api.invitations.getOrganizationInvites, {
    organizationId,
  });

  const deleteInvite = useMutation(api.invitations.deleteInvite);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(`/organizations/${organizationId}/members`)}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
        >
          {t("components.employeesSection.viewAllMembers")}
          <ArrowRight className="h-4 w-4" />
        </motion.button>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Mail className="h-4 w-4" />
            {t("components.employeesSection.inviteMembers")}
          </motion.button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">{t("components.employeesSection.teamMembers")}</h3>

        {members === undefined ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : members === null || members.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-muted-foreground">{t("components.employeesSection.noMembers")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {member.user?.image ? (
                    <Image
                      src={member.user.image}
                      alt={member.user.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{member.user?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.user?.email}
                    </p>
                  </div>
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getRoleBadgeClass(member.role)}`}
                >
                  {getRoleIcon(member.role)}
                  <span>{member.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">{t("components.employeesSection.pendingInvitations")}</h3>

          {invites === undefined ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : invites === null || invites.length === 0 ? (
            <div className="text-center py-8">
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
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("components.employeesSection.invitedOn")}{" "}
                        {new Date(invite._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(invite.status)}`}
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
        </div>
      )}

      <InviteModal
        organizationId={organizationId}
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />
    </div>
  );
}
