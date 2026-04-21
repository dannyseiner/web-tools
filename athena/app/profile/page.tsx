"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "motion/react";
import {
  User,
  Mail,
  Calendar,
  Loader2,
  Camera,
  ArrowLeft,
  LogOut,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/modules/core/ui/avatar";
import { Button } from "@/modules/core/ui/button";
import { Input } from "@/modules/core/ui/input";
import { useRouter } from "next/navigation";
import { getInitials } from "@/modules/core/lib/format";
import { useAuthActions } from "@convex-dev/auth/react";
import { useLoader } from "@/modules/core/hooks/use-loader";
import { exportWithMainLayout } from "@/modules/core/layouts/main-layout";
import { useTranslations } from "next-intl";
import { UserProfile } from "@/lib/convex-types";
import { TFunction } from "@/lib/i18n";

function ProfilePage() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const profile = useQuery(api.profile.getProfile);
  const { setLoading } = useLoader();
  const t = useTranslations();

  const handleSignOut = async () => {
    setLoading({
      loading: true,
      title: t("pages.profile.signingOut"),
      description: t("pages.profile.signingOutDesc"),
    });

    try {
      await signOut();
      setLoading({
        loading: true,
        title: t("pages.profile.signedOut"),
        description: t("pages.profile.signedOutDesc"),
        state: "success",
      });
      router.push("/auth");
    } catch (error) {
      setLoading({
        loading: false,
        title: t("pages.profile.errorSigningOut"),
        description: t("pages.profile.errorSigningOutDesc"),
        state: "error",
      });
    }
  };

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {t("pages.profile.loadingProfile")}
          </p>
        </div>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t("pages.profile.notLoggedInTitle")}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("pages.profile.notLoggedInDesc")}
          </p>
          <Button onClick={() => router.push("/auth")}>
            {t("pages.profile.goToLogin")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          {t("common.back")}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="h-32 bg-gradient-to-r from-primary via-orange-500 to-pink-500" />

          <div className="px-8 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-card shadow-xl">
                    {profile.image && (
                      <AvatarImage
                        src={profile.image}
                        alt={profile.name || "User"}
                      />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      {getInitials(profile.name, profile.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center cursor-pointer">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>

                <div className="space-y-1 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">
                    {profile.name || "User"}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">
                      {profile.email || "No email"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {t("pages.profile.joined")}{" "}
                      {new Date(profile._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground shadow-md">
                <User className="h-5 w-5" />
                <span className="font-medium">
                  {t("pages.profile.tabs.profile")}
                </span>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-destructive/10 text-destructive border border-destructive/20"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">
                  {t("pages.profile.tabs.logout")}
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-xl p-6">
              <ProfileTab profile={profile} t={t} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ProfileTab({ profile, t }: { profile: UserProfile; t: TFunction }) {
  const updateProfile = useMutation(api.profile.updateProfile);
  const [name, setName] = useState(profile.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(profile.name ?? "");
  }, [profile.name]);

  const isDirty = name.trim() !== (profile.name ?? "").trim();
  const canSave = isDirty && name.trim().length > 0 && !saving;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ name: name.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("pages.profile.personalInfo")}
        </h2>
        <p className="text-muted-foreground">
          {t("pages.profile.personalInfoDesc")}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("pages.profile.fullName")}
          </label>
          <Input
            placeholder={t("pages.profile.enterName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={{ name: User, position: "left" }}
            error={error ?? undefined}
          />
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t("pages.profile.emailAddress")}
          </label>
          <Input
            type="email"
            placeholder={t("pages.profile.enterEmail")}
            defaultValue={profile.email || ""}
            icon={{ name: Mail, position: "left" }}
            disabled
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t("pages.profile.emailCannotChange")}
          </p>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={!canSave}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("common.saveChanges")}
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4" />
                {t("common.saveChanges")}
              </>
            ) : (
              t("common.saveChanges")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default exportWithMainLayout(ProfilePage);
