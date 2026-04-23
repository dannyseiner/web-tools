"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Mail, Lock } from "lucide-react";
import { useLoader } from "@/modules/core/hooks/use-loader";
import {
  AuthErrorAlert,
  FormField,
  FormDivider,
  FormHeader,
  SocialLoginSection,
  SubmitButton,
} from "./auth-primitives";

type LoginFormData = {
  email: string;
  password: string;
};

export const LoginForm = () => {
  const t = useTranslations();
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { setLoading } = useLoader();
  const [error, setError] = useState<string | null>(null);

  const schema = z.object({
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
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading({
      loading: true,
      title: t("auth.loggingIn"),
      description: t("auth.loggingInDesc"),
    });
    setError(null);

    const formData = new FormData();
    formData.set("email", data.email);
    formData.set("password", data.password);
    formData.set("flow", "signIn");

    try {
      await signIn("password", formData);
      setLoading({
        loading: true,
        title: t("auth.loggedIn"),
        description: t("auth.loggedInDesc"),
        state: "success",
      });
      router.push("/");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message = raw.includes("InvalidSecret")
        ? t("auth.invalidCredentials")
        : t("errors.generic");
      setError(message);
      setLoading({
        loading: false,
        title: t("auth.errorLoggingIn"),
        description: t("auth.errorLoggingInDesc"),
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
        title={t("auth.welcomeBackTitle")}
        description={t("auth.welcomeBackDesc")}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          custom={0}
          label={t("auth.emailLabel")}
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder={t("auth.emailPlaceholder")}
          icon={Mail}
          error={errors.email?.message}
          register={register("email")}
        />

        <FormField
          custom={1}
          label={t("auth.passwordLabel")}
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder={t("auth.passwordPlaceholder")}
          icon={Lock}
          error={errors.password?.message}
          register={register("password")}
        />

        <AuthErrorAlert error={error} />

        <SubmitButton custom={2}>{t("auth.signIn")}</SubmitButton>

        <FormDivider custom={3} text={t("auth.orContinueWith")} />

        <SocialLoginSection custom={4} onSocialLogin={onSocialLogin} />
      </form>
    </div>
  );
};
