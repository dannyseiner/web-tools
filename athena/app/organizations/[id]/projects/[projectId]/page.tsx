"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { exportWithProjectLayout } from "@/modules/core/layouts/project-layout";
import { useParams, useRouter } from "next/navigation";
import {
  FolderKanban,
  ArrowLeft,
  Calendar,
  User,
  Loader2,
  ListTodo,
  Users,
  FileText,
  BarChart3,
} from "lucide-react";
import { motion } from "motion/react";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations } from "next-intl";
import Image from "next/image";

function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as Id<"organizations">;
  const projectId = params.projectId as Id<"projects">;
  const t = useTranslations();

  const project = useQuery(api.projects.getProject, {
    projectId,
  });

  const organization = useQuery(
    api.organizations.getOrganization,
    project ? { organizationId: project.organizationId } : "skip",
  );

  if (project === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {t("pages.projectDetail.loadingProject")}
          </p>
        </div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <FolderKanban className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t("pages.projectDetail.notFoundTitle")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("pages.projectDetail.notFoundDesc")}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              router.push(`/organizations/${organizationId}/projects`)
            }
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            {t("pages.projectDetail.backToProjects")}
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push(`/organizations/${organizationId}/projects`)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        {t("pages.projectDetail.backToProjects")}
      </motion.button>

      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        {/* Project Info */}
        <div className="p-8">
          <div className="flex items-start gap-6">
            {/* Project Icon */}
            {project.image ? (
              <Image
                src={project.image}
                alt={project.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-background shadow-xl "
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl  border-4 border-background">
                <FolderKanban className="h-12 w-12 text-white" />
              </div>
            )}

            {/* Project Details */}
            <div className="flex-1 -mt-2">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {project.name}
              </h1>
              {project.description ? (
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {project.description}
                </p>
              ) : (
                <p className="text-muted-foreground/60 italic mb-4">
                  {t("pages.projectDetail.noDescription")}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t("pages.projectDetail.created")}
                  </span>
                  <span className="font-medium text-foreground">
                    {new Date(project._creationTime).toLocaleDateString()}
                  </span>
                </div>
                {organization && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t("pages.projectDetail.organization")}
                    </span>
                    <span className="font-medium text-foreground">
                      {organization.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ListTodo className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">
                {t("pages.projectDetail.tasks")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">
                {t("pages.projectDetail.members")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">
                {t("pages.projectDetail.documents")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">
                {t("pages.projectDetail.newErrors")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Coming Soon Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-card border border-border rounded-xl p-12 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FolderKanban className="h-10 w-10 text-primary" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default exportWithProjectLayout(ProjectDetailPage);
