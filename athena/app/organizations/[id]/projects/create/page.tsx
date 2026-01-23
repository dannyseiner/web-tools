"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import {
  FolderKanban,
  ArrowLeft,
  ImageIcon,
  CheckCircle2,
  Loader2,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { Input } from "@/modules/core/ui/input";
import { useLoader } from "@/modules/core/hooks/use-loader";
import { Id } from "@/convex/_generated/dataModel";
import { useTranslations } from "next-intl";
import { exportWithOrganizationLayout } from "@/modules/core/layouts/organization-layout";
import Image from "next/image";

function CreateProjectPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as Id<"organizations">;
  const createProject = useMutation(api.projects.createProject);
  const { setLoading } = useLoader();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const t = useTranslations();

  const createProjectSchema = z.object({
    name: z
      .string()
      .min(1, t("pages.projectsCreate.validation.nameRequired"))
      .min(3, t("pages.projectsCreate.validation.nameMinLength"))
      .max(100, t("pages.projectsCreate.validation.nameMaxLength")),
    description: z
      .string()
      .max(500, t("pages.projectsCreate.validation.descMaxLength"))
      .optional(),
    image: z
      .string()
      .url(t("pages.projectsCreate.validation.imageInvalid"))
      .optional()
      .or(z.literal("")),
  });

  type CreateProjectFormData = z.infer<typeof createProjectSchema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
  });

  const imageUrl = watch("image");

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      setLoading({
        loading: true,
        title: t("pages.projectsCreate.creatingProject"),
        description: t("pages.projectsCreate.creatingProjectDesc"),
      });
      setError(null);

      const projectId = await createProject({
        organizationId,
        name: data.name,
        description: data.description || undefined,
        image: data.image || undefined,
      });

      setIsSuccess(true);
      setLoading({
        loading: true,
        title: t("pages.projectsCreate.projectCreated"),
        description: t("pages.projectsCreate.projectCreatedDesc"),
        state: "success",
      });

      setTimeout(() => {
        router.push(`/organizations/${organizationId}/projects/${projectId}`);
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t("pages.projectsCreate.failedToCreate"),
      );
      setLoading({
        loading: false,
        title: t("pages.projectsCreate.errorCreatingProject"),
        description:
          error instanceof Error ? error.message : t("errors.unknownError"),
        state: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="max-w-6xl mx-auto p-6 py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(`/organizations/${organizationId}`)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          {t("pages.projectsCreate.backToOrganization")}
        </motion.button>

        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-orange-500/10 p-8 border-b border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                  <FolderKanban className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {t("pages.projectsCreate.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("pages.projectsCreate.subtitle")}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              {/* Project Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  {t("pages.projectsCreate.nameLabel")}{" "}
                  <span className="text-destructive">{t("common.required")}</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("pages.projectsCreate.namePlaceholder")}
                  icon={{ name: FolderKanban, position: "left" }}
                  error={errors.name?.message}
                  {...register("name")}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("pages.projectsCreate.nameHint")}
                </p>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  {t("pages.projectsCreate.descriptionLabel")}{" "}
                  <span className="text-muted-foreground">
                    {t("common.optional")}
                  </span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder={t("pages.projectsCreate.descriptionPlaceholder")}
                  className={`w-full px-4 py-3 bg-background border ${
                    errors.description
                      ? "border-destructive"
                      : "border-border focus:border-primary"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground`}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.description.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {t("pages.projectsCreate.descriptionHint")}
                </p>
              </motion.div>

              {/* Image URL */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  {t("pages.projectsCreate.imageLabel")}{" "}
                  <span className="text-muted-foreground">
                    {t("common.optional")}
                  </span>
                </label>
                <Input
                  id="image"
                  type="url"
                  placeholder={t("pages.projectsCreate.imagePlaceholder")}
                  icon={{ name: ImageIcon, position: "left" }}
                  error={errors.image?.message}
                  {...register("image")}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("pages.projectsCreate.imageHint")}
                </p>

                {/* Image Preview */}
                {imageUrl && imageUrl.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 p-4 bg-accent/50 rounded-lg border border-border"
                  >
                    <p className="text-xs font-medium text-foreground mb-2">
                      {t("pages.projectsCreate.logoPreview")}
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        src={imageUrl}
                        alt="Project preview"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover border border-border shadow-md bg-white"
                      />
                      <div className="text-xs text-muted-foreground">
                        {t("pages.projectsCreate.logoPreviewHint")}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Success Message */}
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div className="text-sm text-green-600">
                    {t("pages.projectsCreate.successMessage")}
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/organizations/${organizationId}`)}
                  disabled={isSubmitting}
                  className="flex-1 bg-background hover:bg-accent text-foreground font-semibold py-3 rounded-lg border border-border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("common.cancel")}
                </motion.button>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting || isSuccess}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t("pages.projectsCreate.creating")}
                    </>
                  ) : (
                    <>
                      <FolderKanban className="h-5 w-5" />
                      {t("common.create")}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default exportWithOrganizationLayout(CreateProjectPage);
