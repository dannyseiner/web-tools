"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import {
  Loader2,
  Save,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  FolderKanban,
} from "lucide-react";
import { motion } from "motion/react";
import { exportWithProjectLayout } from "@/modules/core/layouts/project-layout";
import { FileUpload, UploadedFile } from "@/modules/core/ui/file-upload";
import Image from "next/image";
import { useTranslations } from "next-intl";

function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;
  const t = useTranslations("pages.projectSettings");

  const project = useQuery(api.projects.getProject, { projectId });
  const settings = useQuery(api.projectSettings.getProjectSettings, {
    projectId,
  });
  const updateProject = useMutation(api.projects.updateProject);
  const generateToken = useMutation(api.projects.generateApiToken);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [tokenRevealed, setTokenRevealed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description ?? "");
      setImage(project.image ?? "");
    }
  }, [project]);

  if (project === undefined || settings === undefined) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const apiKey = settings?.apiKey;

  function handleFilesChange(files: UploadedFile[]) {
    setUploadedFiles(files);
    if (files.length > 0) {
      setImage(files[0].base64);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateProject({
        projectId,
        name: name.trim(),
        description: description.trim() || undefined,
        image: image || undefined,
      });
      setSaved(true);
      setUploadedFiles([]);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateToken() {
    setGenerating(true);
    try {
      await generateToken({ projectId });
      setTokenRevealed(true);
    } finally {
      setGenerating(false);
    }
  }

  function handleCopyToken() {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Project Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-foreground">
          {t("general")}
        </h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            {t("name")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            {t("description")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            {t("projectImage")}
          </label>

          {image && uploadedFiles.length === 0 && (
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border shadow-sm shrink-0">
                {image.startsWith("data:") ? (
                  <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center">
                    <FolderKanban className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {t("currentImage")}
                </p>
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="text-sm text-destructive hover:underline mt-1"
                >
                  {t("removeImage")}
                </button>
              </div>
            </div>
          )}

          <FileUpload
            accept="image/*"
            maxSize={2 * 1024 * 1024}
            maxFiles={1}
            files={uploadedFiles}
            onFilesChange={handleFilesChange}
            label={t("uploadLabel")}
            showPreview
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saved ? t("saved") : t("saveChanges")}
          </button>
        </div>
      </motion.div>

      {/* API Token */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Key className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("apiToken")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("apiTokenDesc")}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {!apiKey ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                {t("noToken")}
              </p>
              <button
                type="button"
                onClick={handleGenerateToken}
                disabled={generating}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Key className="h-4 w-4" />
                )}
                {t("generateToken")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="relative flex-1 rounded-lg border border-input bg-background px-3 py-2.5 font-mono text-sm cursor-pointer select-none"
                  onClick={() => setTokenRevealed(!tokenRevealed)}
                >
                  {tokenRevealed ? (
                    <span className="break-all">{apiKey}</span>
                  ) : (
                    <span className="text-muted-foreground tracking-widest">
                      {"*".repeat(Math.min(apiKey.length, 35))}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setTokenRevealed(!tokenRevealed)}
                  className="rounded-lg border border-input p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title={tokenRevealed ? t("hide") : t("reveal")}
                >
                  {tokenRevealed ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="rounded-lg border border-input p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title={t("copy")}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {t("regenerateWarning")}
                </p>
                <button
                  type="button"
                  onClick={handleGenerateToken}
                  disabled={generating}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  {generating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  {t("regenerate")}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default exportWithProjectLayout(ProjectSettingsPage);
