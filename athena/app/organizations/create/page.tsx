"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { exportWithMainLayout } from "@/modules/core/layouts/main-layout";
import {
  Building2,
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/modules/core/ui/input";
import { useLoader } from "@/modules/core/hooks/use-loader";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { FileUpload, UploadedFile } from "@/modules/core/ui/file-upload";

type CreateOrgFormData = {
  name: string;
  description?: string;
};

function CreateOrganizationPage() {
  const router = useRouter();
  const createOrganization = useMutation(api.organizations.createOrganization);
  const { setLoading } = useLoader();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const t = useTranslations();

  const createOrgSchema = z.object({
    name: z
      .string()
      .min(1, t("pages.organizationsCreate.validation.nameRequired"))
      .min(3, t("pages.organizationsCreate.validation.nameMinLength"))
      .max(50, t("pages.organizationsCreate.validation.nameMaxLength")),
    description: z
      .string()
      .max(200, t("pages.organizationsCreate.validation.descMaxLength"))
      .optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrgFormData>({
    resolver: zodResolver(createOrgSchema),
  });

  const onSubmit = async (data: CreateOrgFormData) => {
    setLoading({
      loading: true,
      title: t("pages.organizationsCreate.creatingOrg"),
      description: t("pages.organizationsCreate.creatingOrgDesc"),
    });
    setError(null);

    try {
      const result = await createOrganization({
        name: data.name,
        description: data.description || undefined,
        image: uploadedFiles.length > 0 ? uploadedFiles[0].base64 : undefined,
      });

      setIsSuccess(true);
      setLoading({
        loading: true,
        title: t("pages.organizationsCreate.orgCreated"),
        description: t("pages.organizationsCreate.orgCreatedDesc"),
        state: "success",
      });

      // Redirect to the new organization page after a short delay
      setTimeout(() => {
        router.push(`/organizations/${result.organizationId}`);
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t("pages.organizationsCreate.failedToCreate"),
      );
      setLoading({
        loading: false,
        title: t("pages.organizationsCreate.errorCreatingOrg"),
        description:
          error instanceof Error ? error.message : t("errors.unknownError"),
        state: "error",
      });
    }
  };

  const formFieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        delay: custom * 0.1,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-accent/5">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/organizations")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          {t("pages.organizationsCreate.backToOrganizations")}
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-orange-600 mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t("pages.organizationsCreate.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("pages.organizationsCreate.subtitle")}
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-8 shadow-lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Organization Name */}
            <motion.div
              custom={0}
              variants={formFieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t("pages.organizationsCreate.nameLabel")}{" "}
                <span className="text-destructive">{t("common.required")}</span>
              </label>
              <Input
                id="name"
                type="text"
                placeholder={t("pages.organizationsCreate.namePlaceholder")}
                icon={{ name: Building2, position: "left" }}
                error={errors.name?.message}
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("pages.organizationsCreate.nameHint")}
              </p>
            </motion.div>

            {/* Description */}
            <motion.div
              custom={1}
              variants={formFieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label
                htmlFor="description"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {t("pages.organizationsCreate.descriptionLabel")}{" "}
                <span className="text-muted-foreground">
                  {t("common.optional")}
                </span>
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder={t(
                  "pages.organizationsCreate.descriptionPlaceholder",
                )}
                className={`w-full px-4 py-3 bg-background border ${
                  errors.description
                    ? "border-destructive focus:ring-destructive"
                    : "border-border focus:ring-primary"
                } rounded-lg focus:outline-none focus:ring-2 transition-all resize-none text-foreground placeholder:text-muted-foreground`}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {t("pages.organizationsCreate.descriptionHint")}
              </p>
            </motion.div>

            {/* Image Upload */}
            <motion.div
              custom={2}
              variants={formFieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("pages.organizationsCreate.imageLabel")}{" "}
                <span className="text-muted-foreground">
                  {t("common.optional")}
                </span>
              </label>
              <FileUpload
                accept="image/*"
                maxSize={5 * 1024 * 1024}
                maxFiles={1}
                files={uploadedFiles}
                onFilesChange={setUploadedFiles}
                label={t("pages.organizationsCreate.uploadImageLabel")}
                showPreview={true}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t("pages.organizationsCreate.imageHint")}
              </p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3"
                >
                  <div className="text-sm text-destructive">{error}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div className="text-sm text-green-600">
                    {t("pages.organizationsCreate.successMessage")}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div
              custom={3}
              variants={formFieldVariants}
              initial="hidden"
              animate="visible"
              className="flex gap-4 pt-4"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/organizations")}
                disabled={isSubmitting || isSuccess}
                className="flex-1 bg-background hover:bg-accent text-foreground font-semibold py-3 rounded-lg border border-border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting || isSuccess}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t("pages.organizationsCreate.creating")}
                  </>
                ) : (
                  <>
                    <Building2 className="h-5 w-5" />
                    {t("pages.organizations.createOrganization")}
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-primary/5 border border-primary/10 rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-2">
            {t("pages.organizationsCreate.whatHappensNext")}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{t("pages.organizationsCreate.step1")}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{t("pages.organizationsCreate.step2")}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{t("pages.organizationsCreate.step3")}</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

export default exportWithMainLayout(CreateOrganizationPage);
