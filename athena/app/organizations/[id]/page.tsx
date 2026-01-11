"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { exportWithOrganizationLayout } from "@/modules/core/layouts/organization-layout";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  Users,
  Crown,
  Briefcase,
  Calendar,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { Id } from "@/convex/_generated/dataModel";

function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as Id<"organizations">;

  const organization = useQuery(api.organizations.getOrganization, {
    organizationId,
  });

  const getRoleIcon = (role: "Member" | "Manager" | "Admin" | null) => {
    if (!role) return null;
    switch (role) {
      case "Admin":
        return <Crown className="h-5 w-5 text-primary" />;
      case "Manager":
        return <Briefcase className="h-5 w-5 text-orange-500" />;
      case "Member":
        return <Users className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRoleBadgeClass = (role: "Member" | "Manager" | "Admin" | null) => {
    if (!role) return "bg-muted text-muted-foreground border-border";
    switch (role) {
      case "Admin":
        return "bg-primary/10 text-primary border-primary/20";
      case "Manager":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      case "Member":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (organization === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading organization...</p>
        </div>
      </div>
    );
  }

  if (organization === null) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Organization not found
          </h2>
          <p className="text-muted-foreground mb-6">
            This organization doesn&apos;t exist or you don&apos;t have access
            to it
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/organizations")}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Organizations
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/organizations")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Organizations
      </motion.button>

      {/* Organization Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-8"
      >
        <div className="flex items-start gap-6">
          {/* Organization Logo */}
          {organization.image ? (
            <img
              src={organization.image}
              alt={organization.name}
              className="w-24 h-24 rounded-2xl object-cover border border-border shadow-md bg-white"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-md">
              <Building2 className="h-12 w-12 text-white" />
            </div>
          )}

          {/* Organization Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {organization.name}
                </h1>
                {organization.userRole && (
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${getRoleBadgeClass(organization.userRole)}`}
                  >
                    {getRoleIcon(organization.userRole)}
                    <span>Your role: {organization.userRole}</span>
                  </div>
                )}
              </div>
            </div>

            {organization.description && (
              <p className="text-muted-foreground leading-relaxed">
                {organization.description}
              </p>
            )}
          </div>
        </div>

        {/* Organization Metadata */}
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium text-foreground">
                {new Date(organization._creationTime).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      {organization.userRole === "Admin" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">
            Admin Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left"
            >
              <Users className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">
                Manage Members
              </h3>
              <p className="text-sm text-muted-foreground">
                Invite and manage team members
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left"
            >
              <Building2 className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">
                Edit Organization
              </h3>
              <p className="text-sm text-muted-foreground">
                Update organization details
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left"
            >
              <Briefcase className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">
                View Settings
              </h3>
              <p className="text-sm text-muted-foreground">
                Configure organization settings
              </p>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-3">
          About Organization Roles
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Crown className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Admin</p>
              <p className="text-sm text-muted-foreground">
                Full access to manage organization, members, and settings
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Briefcase className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Manager</p>
              <p className="text-sm text-muted-foreground">
                Can manage projects and invite members
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">Member</p>
              <p className="text-sm text-muted-foreground">
                Can view and participate in organization activities
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default exportWithOrganizationLayout(OrganizationDetailPage);
