"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, FileText, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/modules/core/ui/input";
import { motion } from "motion/react";
import { useLoader } from "@/modules/core/hooks/use-loader";
import { FileUpload, UploadedFile } from "@/modules/core/ui/file-upload";

// Zod schema for organization validation
const organizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function CreateOrganization() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [logoFiles, setLogoFiles] = useState<UploadedFile[]>([]);
  const createOrganization = useMutation(api.organizations.createOrganization);
  const { setLoading } = useLoader();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  });

  const onSubmit = async (data: OrganizationFormData) => {
    setLoading({
      loading: true,
      title: "Creating organization",
      description: "Setting up your organization...",
    });
    setError(null);

    try {
      const result = await createOrganization({
        name: data.name,
        description: data.description || undefined,
        image: logoFiles.length > 0 ? logoFiles[0].base64 : undefined,
      });

      setLoading({
        loading: true,
        title: "Organization created",
        description: "Your organization has been created successfully",
        state: "success",
      });

      // Redirect to organization page
      router.push(`/organizations/${result.organizationId}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create organization";
      setError(errorMessage);
      setLoading({
        loading: false,
        title: "Error creating organization",
        description: errorMessage,
        state: "error",
      });
    }
  };

  const formFieldVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        delay: custom * 0.1,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-background-dim flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create New Organization
          </h1>
          <p className="text-muted-foreground">
            Set up a new organization to collaborate with your team
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-card rounded-xl shadow-lg border border-border p-8"
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
                Organization Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Acme Corporation"
                icon={{ name: Building2, position: "left" }}
                error={errors.name?.message}
                aria-invalid={!!errors.name}
                {...register("name")}
              />
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
                Description{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
                <textarea
                  id="description"
                  rows={4}
                  placeholder="A brief description of your organization..."
                  className={`w-full pl-10 pr-4 py-3 bg-background border rounded-lg outline-none transition-all placeholder:text-muted-foreground resize-none ${
                    errors.description
                      ? "border-destructive ring-destructive/20"
                      : "border-border focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
                  }`}
                  {...register("description")}
                />
              </div>
              {errors.description && (
                <p className="mt-1.5 text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </motion.div>

            {/* Logo Upload */}
            <motion.div
              custom={2}
              variants={formFieldVariants}
              initial="hidden"
              animate="visible"
            >
              <label className="block text-sm font-medium text-foreground mb-2">
                Organization Logo{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </label>
              <FileUpload
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
                maxFiles={1}
                multiple={false}
                files={logoFiles}
                onFilesChange={setLogoFiles}
                label="Upload organization logo"
                showPreview={true}
                showSize={true}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Upload a logo for your organization (PNG, JPG, or GIF)
              </p>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-destructive/10 border border-destructive/30 rounded-lg p-4"
              >
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              custom={3}
              variants={formFieldVariants}
              initial="hidden"
              animate="visible"
              className="flex gap-4 pt-4"
            >
              <motion.button
                type="button"
                onClick={() => router.back()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 px-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Organization"
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3">
            What happens next?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>You will be assigned as the organization admin</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>You can invite team members to join</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Manage roles and permissions for your team</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
