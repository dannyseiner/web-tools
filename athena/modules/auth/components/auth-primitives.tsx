"use client";

import { AlertCircle, Github, LucideIcon } from "lucide-react";
import {
  AnimatePresence,
  motion,
  Variants,
} from "motion/react";
import { UseFormRegisterReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Input } from "@/modules/core/ui/input";

export const formFieldVariants: Variants = {
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

type FormFieldProps = {
  custom: number;
  label: string;
  id: string;
  type: string;
  autoComplete?: string;
  placeholder: string;
  icon: LucideIcon;
  error?: string;
  register: UseFormRegisterReturn;
};

export const FormField = ({
  custom,
  label,
  id,
  type,
  autoComplete,
  placeholder,
  icon,
  error,
  register,
}: FormFieldProps) => (
  <motion.div
    custom={custom}
    variants={formFieldVariants}
    initial="hidden"
    animate="visible"
  >
    <label
      htmlFor={id}
      className="block text-sm font-medium text-foreground mb-2"
    >
      {label}
    </label>
    <Input
      id={id}
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      icon={{ name: icon, position: "left" }}
      error={error}
      aria-invalid={!!error}
      {...register}
    />
  </motion.div>
);

export const SubmitButton = ({
  custom,
  children,
}: {
  custom: number;
  children: React.ReactNode;
}) => (
  <motion.button
    custom={custom}
    variants={formFieldVariants}
    initial="hidden"
    animate="visible"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type="submit"
    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
  >
    {children}
  </motion.button>
);

export const FormDivider = ({
  custom,
  text,
}: {
  custom: number;
  text: string;
}) => (
  <motion.div
    custom={custom}
    variants={formFieldVariants}
    initial="hidden"
    animate="visible"
    className="relative flex items-center justify-center"
  >
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-border" />
    </div>
    <div className="relative px-4 text-sm text-muted-foreground bg-card">
      {text}
    </div>
  </motion.div>
);

const SocialButton = ({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="flex items-center justify-center gap-2 py-3 px-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors font-medium text-sm"
  >
    {icon}
    {children}
  </motion.button>
);

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const SocialLoginSection = ({
  custom,
  onSocialLogin,
}: {
  custom: number;
  onSocialLogin: (provider: "github" | "google") => void;
}) => {
  const t = useTranslations();
  return (
    <motion.div
      custom={custom}
      variants={formFieldVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-3"
    >
      <SocialButton
        onClick={() => onSocialLogin("github")}
        icon={<Github className="h-5 w-5" />}
      >
        {t("auth.github")}
      </SocialButton>
      <SocialButton
        onClick={() => onSocialLogin("google")}
        icon={<GoogleIcon />}
      >
        {t("auth.google")}
      </SocialButton>
    </motion.div>
  );
};

export const AuthErrorAlert = ({ error }: { error: string | null }) => (
  <AnimatePresence>
    {error && (
      <motion.div
        className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3"
        initial={{ opacity: 0, height: 0, marginTop: 0 }}
        animate={{ opacity: 1, height: "auto", marginTop: 20 }}
        exit={{ opacity: 0, height: 0, marginTop: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <p className="text-sm text-destructive">{error}</p>
      </motion.div>
    )}
  </AnimatePresence>
);

export const FormHeader = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <motion.div
    className="text-center mb-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.4 }}
  >
    <h2 className="text-2xl font-bold text-foreground mb-1">{title}</h2>
    <p className="text-sm text-muted-foreground">{description}</p>
  </motion.div>
);
