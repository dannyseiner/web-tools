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
  FolderKanban,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations } from "next-intl";
import { EmployeesSection } from "@/modules/organizations/components/employees-section";

function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as Id<"organizations">;
  const t = useTranslations();

  const organization = useQuery(api.organizations.getOrganization, {
    organizationId,
  });

  const projects = useQuery(api.projects.getOrganizationProjects, {
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
          <p className="text-muted-foreground">
            {t("pages.organizationDetail.loadingOrg")}
          </p>
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
            {t("pages.organizationDetail.notFoundTitle")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("pages.organizationDetail.notFoundDesc")}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/organizations")}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            {t("pages.organizationDetail.backToOrganizations")}
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
        {t("pages.organizationDetail.backToOrganizations")}
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
            <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-primary to-orange-600 flex items-center justify-center shadow-md">
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
                    <span>
                      {t("pages.organizationDetail.yourRole")}:{" "}
                      {organization.userRole}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {organization.description ? (
              <p className="text-muted-foreground leading-relaxed">
                {organization.description}
              </p>
            ) : (
              <p className="text-muted-foreground/60 leading-relaxed italic">
                {t("pages.organizationDetail.noDescription")}
              </p>
            )}
          </div>
        </div>

        {/* Organization Metadata */}
        <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">
                {t("pages.organizationDetail.created")}
              </p>
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

      {/* Projects Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderKanban className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold text-foreground">
                {t("pages.organizationDetail.projectsSection")}
              </h2>
            </div>
            {(organization.userRole === "Admin" ||
              organization.userRole === "Manager") && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  router.push(
                    `/organizations/${organizationId}/projects/create`,
                  )
                }
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                {t("pages.organizationDetail.createProject")}
              </motion.button>
            )}
          </div>

          {projects === undefined ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : projects === null || projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FolderKanban className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t("pages.organizationDetail.noProjects")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("pages.organizationDetail.noProjectsDesc")}
              </p>
              {(organization.userRole === "Admin" ||
                organization.userRole === "Manager") && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    router.push(
                      `/organizations/${organizationId}/projects/create`,
                    )
                  }
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="h-5 w-5" />
                  {t("pages.organizationDetail.createFirstProject")}
                </motion.button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <motion.div
                  key={project._id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    router.push(
                      `/organizations/${organizationId}/projects/${project._id}`,
                    )
                  }
                  className="bg-background border border-border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-3">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-12 h-12 rounded-lg object-cover border border-border shadow-sm bg-white"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-sm">
                        <FolderKanban className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      {project.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground/60 italic">
                          {t("pages.organizationDetail.noDescription")}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Members Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">
            {t("pages.organizationDetail.membersSection")}
          </h2>
        </div>
        <EmployeesSection
          organizationId={organizationId}
          isAdmin={organization.userRole === "Admin"}
        />
      </motion.div>
    </div>
  );
}

export default exportWithOrganizationLayout(OrganizationDetailPage);
