"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import {
  Loader2,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronRight,
  Calendar,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { exportWithProjectLayout } from "@/modules/core/layouts/project-layout";
import { useDebounce } from "@/modules/core/hooks/use-debounce";

function ErrorsPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;
  const t = useTranslations("pages.reportedErrors");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [errorName, setErrorName] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const errors = useQuery(api.errors.getReportedErrors, {
    projectId,
    search: debouncedSearch.trim() || undefined,
    errorName: errorName || undefined,
    fromTimestamp: fromDate ? new Date(fromDate).toISOString() : undefined,
    toTimestamp: toDate
      ? new Date(toDate + "T23:59:59.999Z").toISOString()
      : undefined,
    limit: 200,
  });

  const uniqueErrorNames = useMemo(() => {
    if (!errors) return [];
    const names = new Set(errors.map((e) => e.name));
    return Array.from(names).sort();
  }, [errors]);

  if (errors === undefined) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {errors.length === 1
                ? t("countOne")
                : t("countOther", { count: errors.length })}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="h-4 w-4" />
          {t("filters")}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={errorName}
            onChange={(e) => setErrorName(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t("allTypes")}</option>
            {uniqueErrorNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setErrorName("");
              setFromDate("");
              setToDate("");
            }}
            className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            {t("clearFilters")}
          </button>
        </div>
      </div>

      {/* Error list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {errors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {t("empty")}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            <AnimatePresence>
              {errors.map((err) => {
                const isExpanded = expandedId === err._id;
                return (
                  <motion.li
                    key={err._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-card"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : err._id)}
                      className="flex w-full items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <span className="mt-0.5 shrink-0 text-muted-foreground">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                            {err.name}
                          </span>
                          {err.app && (
                            <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {err.app}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(err.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm font-medium text-foreground">
                          {err.message}
                        </p>
                        {err.url && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {err.url}
                          </p>
                        )}
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-border bg-muted/20"
                        >
                          <div className="space-y-4 p-4 font-mono text-xs">
                            {err.stack && (
                              <div>
                                <p className="mb-1 font-sans font-medium text-foreground">
                                  {t("stackTrace")}
                                </p>
                                <pre className="whitespace-pre-wrap break-words rounded bg-background p-3 text-muted-foreground">
                                  {err.stack}
                                </pre>
                              </div>
                            )}
                            {err.userAgent && (
                              <div>
                                <p className="mb-1 font-sans font-medium text-foreground">
                                  {t("userAgent")}
                                </p>
                                <p className="rounded bg-background p-3 text-muted-foreground break-all">
                                  {err.userAgent}
                                </p>
                              </div>
                            )}
                            {(err.env || err.release) && (
                              <div className="flex gap-4">
                                {err.env && (
                                  <span>
                                    <span className="text-muted-foreground">
                                      {t("env")}
                                    </span>{" "}
                                    {err.env}
                                  </span>
                                )}
                                {err.release && (
                                  <span>
                                    <span className="text-muted-foreground">
                                      {t("release")}
                                    </span>{" "}
                                    {err.release}
                                  </span>
                                )}
                              </div>
                            )}
                            {err.extraJson && (
                              <div>
                                <p className="mb-1 font-sans font-medium text-foreground">
                                  {t("extra")}
                                </p>
                                <pre className="whitespace-pre-wrap break-words rounded bg-background p-3 text-muted-foreground">
                                  {JSON.stringify(
                                    JSON.parse(err.extraJson),
                                    null,
                                    2,
                                  )}
                                </pre>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

export default exportWithProjectLayout(ErrorsPage);
