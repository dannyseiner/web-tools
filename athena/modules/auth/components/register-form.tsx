"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Mail, Lock, User } from "lucide-react";
import { motion } from "motion/react";
import { useLoader } from "@/modules/core/hooks/use-loader";
import {
  AuthErrorAlert,
  FormField,
  FormDivider,
  FormHeader,
  formFieldVariants,
  SocialLoginSection,
  SubmitButton,
} from "./auth-primitives";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
};

export const RegisterForm = () => {
  const t = useTranslations();
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { setLoading } = useLoader();
  const [error, setError] = useState<string | null>(null);

  const schema = z.object({
    name: z
      .string()
      .min(1, t("auth.validation.nameRequired"))
      .min(2, t("auth.validation.nameMinLength")),
    email: z
      .string()
      .min(1, t("auth.validation.emailRequired"))
      .email(t("auth.validation.emailInvalid")),
    password: z
      .string()
      .min(1, t("auth.validation.passwordRequired"))
      .min(8, t("auth.validation.passwordMinLength")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading({
      loading: true,
      title: t("auth.creatingAccount"),
      description: t("auth.creatingAccountDesc"),
    });
    setError(null);

    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("email", data.email);
    formData.set("password", data.password);
    formData.set("flow", "signUp");

    try {
      await signIn("password", formData);
      setLoading({
        loading: true,
        title: t("auth.accountCreated"),
        description: t("auth.accountCreatedDesc"),
        state: "success",
      });
      router.push("/");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message = /already exists/i.test(raw)
        ? t("auth.accountAlreadyExists")
        : t("errors.generic");
      setError(message);
      setLoading({
        loading: false,
        title: t("auth.errorCreatingAccount"),
        description: t("auth.errorCreatingAccountDesc"),
        state: "error",
      });
    }
  };

  const onSocialLogin = async (provider: "github" | "google") => {
    const providerName =
      provider === "github" ? t("auth.github") : t("auth.google");
    setLoading({
      loading: true,
      title: `${t("auth.signingInWith")} ${providerName}`,
      description: t("auth.redirectingToAuth"),
    });
    setError(null);

    try {
      await signIn(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
      setLoading({
        loading: false,
        title: t("auth.errorSigningIn"),
        description: `${t("auth.errorSigningInWith")} ${providerName}`,
        state: "error",
      });
    }
  };

  return (
    <div>
      <FormHeader
        title={t("auth.createAccountTitle")}
        description={t("auth.createAccountDesc")}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          custom={0}
          label={t("auth.fullNameLabel")}
          id="register-name"
          type="text"
          autoComplete="name"
          placeholder={t("auth.fullNamePlaceholder")}
          icon={User}
          error={errors.name?.message}
          register={register("name")}
        />

        <FormField
          custom={1}
          label={t("auth.emailLabel")}
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder={t("auth.emailPlaceholder")}
          icon={Mail}
          error={errors.email?.message}
          register={register("email")}
        />

        <FormField
          custom={2}
          label={t("auth.passwordLabel")}
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder={t("auth.passwordPlaceholderNew")}
          icon={Lock}
          error={errors.password?.message}
          register={register("password")}
        />

        <AuthErrorAlert error={error} />

        <SubmitButton custom={3}>{t("auth.signUp")}</SubmitButton>

        <FormDivider custom={4} text={t("auth.orContinueWith")} />

        <SocialLoginSection custom={5} onSocialLogin={onSocialLogin} />

        <motion.p
          className="text-xs text-center text-muted-foreground"
          custom={6}
          variants={formFieldVariants}
          initial="hidden"
          animate="visible"
        >
          {t("auth.termsPrefix")}{" "}
          <a href="#" className="text-primary hover:text-primary/80">
            {t("auth.termsOfService")}
          </a>{" "}
          {t("auth.and")}{" "}
          <a href="#" className="text-primary hover:text-primary/80">
            {t("auth.privacyPolicy")}
          </a>
        </motion.p>
      </form>
    </div>
  );
};
