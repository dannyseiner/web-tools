"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import {
  Loader2,
  Save,
  Check,
  Building2,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { exportWithOrganizationLayout } from "@/modules/core/layouts/organization-layout";
import { FileUpload, UploadedFile } from "@/modules/core/ui/file-upload";
import Image from "next/image";
import { useTranslations } from "next-intl";

function OrganizationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as Id<"organizations">;
  const t = useTranslations();

  const organization = useQuery(api.organizations.getOrganization, {
    organizationId,
  });
  const updateOrganization = useMutation(api.organizations.updateOrganization);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setDescription(organization.description ?? "");
      setImage(organization.image ?? "");
    }
  }, [organization]);

  if (organization === undefined) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (organization === null || !organization.isOwner) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t("pages.organizationSettings.accessDenied")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("pages.organizationSettings.ownerOnly")}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/organizations/${organizationId}`)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            {t("pages.organizationSettings.backToOrganization")}
          </motion.button>
        </div>
      </div>
    );
  }

  function handleFilesChange(files: UploadedFile[]) {
    setUploadedFiles(files);
    if (files.length > 0) {
      setImage(files[0].base64);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateOrganization({
        organizationId,
        name: name.trim(),
        description: description.trim(),
        image: image || undefined,
      });
      setSaved(true);
      setUploadedFiles([]);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
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
        {t("pages.organizationSettings.backToOrganization")}
      </motion.button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("pages.organizationSettings.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("pages.organizationSettings.subtitle")}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-foreground">
          {t("pages.organizationSettings.general")}
        </h2>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            {t("pages.organizationSettings.name")}
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
            {t("pages.organizationSettings.description")}
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
            {t("pages.organizationSettings.image")}
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
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {t("pages.organizationSettings.currentImage")}
                </p>
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="text-sm text-destructive hover:underline mt-1"
                >
                  {t("pages.organizationSettings.removeImage")}
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
            label={t("pages.organizationSettings.uploadLabel")}
            showPreview
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

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
            {saved
              ? t("pages.organizationSettings.saved")
              : t("pages.organizationSettings.saveChanges")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default exportWithOrganizationLayout(OrganizationSettingsPage);
