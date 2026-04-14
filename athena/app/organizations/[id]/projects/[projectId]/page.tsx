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
  AlertCircle,
  Languages,
} from "lucide-react";
import { motion } from "motion/react";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

function ErrorsChart({
  errors,
}: {
  errors: { timestamp: string; name: string; tagsJson?: string }[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const hourlyData = useMemo(() => {
    const now = Date.now();
    const buckets = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now - (23 - i) * 60 * 60 * 1000);
      hour.setMinutes(0, 0, 0);
      return { label: hour, count: 0 };
    });

    for (const err of errors) {
      const ts = new Date(err.timestamp).getTime();
      for (let i = 0; i < buckets.length; i++) {
        const bucketStart = buckets[i].label.getTime();
        const bucketEnd = bucketStart + 60 * 60 * 1000;
        if (ts >= bucketStart && ts < bucketEnd) {
          buckets[i].count++;
          break;
        }
      }
    }

    return buckets;
  }, [errors]);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: hourlyData.map((b) =>
          b.label.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        ),
        datasets: [
          {
            label: "Errors",
            data: hourlyData.map((b) => b.count),
            backgroundColor: "rgba(239, 68, 68, 0.5)",
            borderColor: "rgb(239, 68, 68)",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 45,
              autoSkip: true,
              maxTicksLimit: 12,
              font: { size: 11 },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 },
            },
            grid: {
              color: "rgba(128, 128, 128, 0.1)",
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [hourlyData]);

  return <canvas ref={canvasRef} />;
}

function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as Id<"organizations">;
  const projectId = params.projectId as Id<"projects">;
  const t = useTranslations();

  const project = useQuery(api.projects.getProject, { projectId });
  const organization = useQuery(
    api.organizations.getOrganization,
    project ? { organizationId: project.organizationId } : "skip",
  );
  const errorsLast24h = useQuery(api.errors.getErrorsLast24h, { projectId });

  const { totalErrors, i18nErrors } = useMemo(() => {
    if (!errorsLast24h) return { totalErrors: 0, i18nErrors: 0 };
    let i18n = 0;
    for (const err of errorsLast24h) {
      if (err.tagsJson) {
        try {
          const tags = JSON.parse(err.tagsJson);
          if (tags.source === "i18n") i18n++;
        } catch {}
      }
    }
    return { totalErrors: errorsLast24h.length, i18nErrors: i18n };
  }, [errorsLast24h]);

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
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
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
        <div className="p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            {project.image ? (
              <Image
                src={project.image}
                alt={project.name}
                width={96}
                height={96}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-background shadow-xl shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl border-4 border-background shrink-0">
                <FolderKanban className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>
            )}

            <div className="flex-1 min-w-0 sm:-mt-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 wrap-break-word">
                {project.name}
              </h1>
              {project.description ? (
                <p className="text-muted-foreground leading-relaxed mb-4 wrap-break-word">
                  {project.description}
                </p>
              ) : (
                <p className="text-muted-foreground/60 italic mb-4">
                  {t("pages.projectDetail.noDescription")}
                </p>
              )}

              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-x-6 sm:gap-y-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground shrink-0">
                    {t("pages.projectDetail.created")}
                  </span>
                  <span className="font-medium text-foreground truncate">
                    {new Date(project._creationTime).toLocaleDateString()}
                  </span>
                </div>
                {organization && (
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground shrink-0">
                      {t("pages.projectDetail.organization")}
                    </span>
                    <span className="font-medium text-foreground truncate">
                      {organization.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dashboard: Chart + Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Chart - takes 2/3 */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium text-foreground mb-4">
            {t("pages.projectDetail.errorsLast24h")}
          </h2>
          <div className="h-64">
            {errorsLast24h === undefined ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ErrorsChart errors={errorsLast24h} />
            )}
          </div>
        </div>

        {/* Stats - takes 1/3 */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-card border border-border rounded-xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{totalErrors}</p>
              <p className="text-sm text-muted-foreground">
                {t("pages.projectDetail.totalErrors24h")}
              </p>
            </div>
          </div>

          <div className="flex-1 bg-card border border-border rounded-xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
              <Languages className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{i18nErrors}</p>
              <p className="text-sm text-muted-foreground">
                {t("pages.projectDetail.i18nErrors24h")}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default exportWithProjectLayout(ProjectDetailPage);
