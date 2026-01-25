"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Building2,
  Zap,
  Plus,
  Folder,
  Settings,
  BarChart3,
  Bell,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { exportWithMainLayout } from "@/modules/core/layouts/main-layout";
import { useTranslations } from "next-intl";
import Image from "next/image";

function HomePage() {
  const router = useRouter();
  const profile = useQuery(api.profile.getProfile);
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const t = useTranslations();

  // Quick links configuration
  const quickLinks = [
    {
      icon: Folder,
      label: t("pages.home.quickLinks.projects"),
      onClick: () => router.push("/organizations"),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Building2,
      label: t("pages.home.quickLinks.organizations"),
      onClick: () => router.push("/organizations"),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: BarChart3,
      label: t("pages.home.quickLinks.analytics"),
      onClick: () => {},
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Bell,
      label: t("pages.home.quickLinks.notifications"),
      onClick: () => {},
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Settings,
      label: t("pages.home.quickLinks.settings"),
      onClick: () => router.push("/profile"),
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-500/10",
    },
  ];

  // Mock projects data (empty for now)
  const projects: Array<{ id: string; name: string; color: string }> = [];

  if (profile === undefined || organizations === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Logo and Welcome */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shrink-0">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                {t("pages.home.welcomeBack") + ", "}
                {profile && profile.name && (
                  <span className="text-primary">{profile.name}</span>
                )}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("pages.home.subtitle")}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 sm:mb-4">
              {t("pages.home.quickLinksTitle")}
            </h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {quickLinks.map((link, index) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={link.onClick}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-card border border-border rounded-lg hover:shadow-md transition-all group"
                >
                  <div
                    className={`${link.bgColor} p-1.5 sm:p-2 rounded-md group-hover:scale-110 transition-transform`}
                  >
                    <link.icon
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${link.color}`}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground">
                    {link.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Projects Section */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {t("pages.home.recentProjects")}
              </h2>
              <button
                onClick={() => {}}
                className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                {t("common.viewAll")}
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
            <div className="relative">
              {projects.length === 0 ? (
                <div className="bg-card border border-dashed border-border rounded-xl p-8 sm:p-12 text-center">
                  <Folder className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    {t("pages.home.noProjects")}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    {t("pages.home.noProjectsDesc")}
                  </p>
                  <button
                    onClick={() => router.push("/organizations")}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4" />
                    {t("pages.home.createFirstProject")}
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent -mx-4 px-4 sm:mx-0 sm:px-0">
                  {projects.map((project) => (
                    <motion.div
                      key={project.id}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="shrink-0 w-56 sm:w-64 bg-card border border-border rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${project.color} mb-3 sm:mb-4`}
                      />
                      <h3 className="text-sm sm:text-base font-semibold text-foreground">
                        {project.name}
                      </h3>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Organizations Section */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {t("pages.home.yourOrganizations")}
              </h2>
              <button
                onClick={() => router.push("/organizations")}
                className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                {t("common.viewAll")}
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
            <div className="relative">
              {organizations.length === 0 ? (
                <div className="bg-card border border-dashed border-border rounded-xl p-8 sm:p-12 text-center">
                  <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    {t("pages.home.noOrganizations")}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    {t("pages.home.noOrganizationsDesc")}
                  </p>
                  <button
                    onClick={() => router.push("/organizations/create")}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4" />
                    {t("pages.home.createFirstOrganization")}
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent -mx-4 px-4 sm:mx-0 sm:px-0">
                  {organizations.map(
                    (
                      org: {
                        _id: string;
                        name: string;
                        description?: string | null;
                        image?: string | null;
                      },
                      index: number,
                    ) => (
                      <motion.button
                        key={org._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        onClick={() => router.push(`/organizations/${org._id}`)}
                        className="shrink-0 w-[280px] sm:w-80 bg-card border border-border rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all text-left group"
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          {org.image ? (
                            <img
                              src={org.image}
                              alt={org.name}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-border shadow-sm bg-white shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br from-primary to-orange-600 flex items-center justify-center shadow-sm shrink-0">
                              <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                              {org.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                              {org.description || t("pages.home.noDescription")}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      </motion.button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
export default exportWithMainLayout(HomePage);
