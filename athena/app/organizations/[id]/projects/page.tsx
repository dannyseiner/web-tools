"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { exportWithOrganizationLayout } from "@/modules/core/layouts/organization-layout";
import { useParams, useRouter } from "next/navigation";
import {
  FolderKanban,
  Plus,
  Loader2,
  Calendar,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations } from "next-intl";
import Image from "next/image";

function ProjectsPage() {
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

  if (organization === undefined || projects === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (organization === null) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t("pages.organizationDetail.notFoundTitle")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("pages.organizationDetail.notFoundDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("pages.projects.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("pages.projects.subtitle")}
          </p>
        </div>
        {(organization.userRole === "Admin" ||
          organization.userRole === "Manager") && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              router.push(`/organizations/${organizationId}/projects/create`)
            }
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            {t("pages.projects.createProject")}
          </motion.button>
        )}
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {projects === null || projects.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FolderKanban className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("pages.projects.noProjects")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("pages.projects.noProjectsDesc")}
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
                {t("pages.projects.createFirstProject")}
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  router.push(
                    `/organizations/${organizationId}/projects/${project._id}`,
                  )
                }
                className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
              >
                {/* Project Image/Icon */}
                <div className="relative h-48 bg-linear-to-br from-primary/20 via-purple-500/20 to-orange-500/20">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FolderKanban className="h-16 w-16 text-primary/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1 truncate group-hover:text-primary-foreground transition-colors">
                      {project.name}
                    </h3>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-6">
                  {project.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground/60 italic mb-4">
                      {t("pages.projects.noDescription")}
                    </p>
                  )}

                  {/* Project Metadata */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(project._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{t("pages.projects.project")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default exportWithOrganizationLayout(ProjectsPage);
