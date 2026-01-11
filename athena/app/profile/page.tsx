"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Settings,
  Shield,
  Activity,
  Mail,
  Calendar,
  Loader2,
  Camera,
  ArrowLeft,
  LogOut,
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

type TabType = "profile" | "settings" | "security" | "activity";

function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
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

  const tabs = [
    {
      id: "profile" as TabType,
      label: t("pages.profile.tabs.profile"),
      icon: User,
    },
    {
      id: "settings" as TabType,
      label: t("pages.profile.tabs.settings"),
      icon: Settings,
    },
    {
      id: "security" as TabType,
      label: t("pages.profile.tabs.security"),
      icon: Shield,
    },
    {
      id: "activity" as TabType,
      label: t("pages.profile.tabs.activity"),
      icon: Activity,
    },
  ];

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
        {/* Back Button */}
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

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-primary via-orange-500 to-pink-500" />

          {/* Profile Info */}
          <div className="px-8 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              {/* Avatar and Name */}
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

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  {t("pages.profile.shareProfile")}
                </Button>
                <Button size="sm">{t("pages.profile.editProfile")}</Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs and Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          {/* Tabs Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-accent text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}

              {/* Sign Out Button */}
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

          {/* Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-border rounded-xl p-6"
              >
                {activeTab === "profile" && (
                  <ProfileTab profile={profile} t={t} />
                )}
                {activeTab === "settings" && <SettingsTab t={t} />}
                {activeTab === "security" && <SecurityTab t={t} />}
                {activeTab === "activity" && <ActivityTab t={t} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ profile, t }: { profile: UserProfile; t: TFunction }) {
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
            defaultValue={profile.name || ""}
            icon={{ name: User, position: "left" }}
          />
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
          <Button>{t("common.saveChanges")}</Button>
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ t }: { t: TFunction }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("pages.profile.preferences")}
        </h2>
        <p className="text-muted-foreground">
          {t("pages.profile.preferencesDesc")}
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">
                {t("pages.profile.notifications")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("pages.profile.notificationsDesc")}
              </p>
            </div>
            <Button variant="outline" size="sm">
              {t("common.configure")}
            </Button>
          </div>
        </div>

        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">
                {t("pages.profile.language")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("pages.profile.languageDesc")}
              </p>
            </div>
            <Button variant="outline" size="sm">
              {t("common.change")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Security Tab Component
function SecurityTab({ t }: { t: TFunction }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("pages.profile.securitySettings")}
        </h2>
        <p className="text-muted-foreground">
          {t("pages.profile.securitySettingsDesc")}
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">
                  {t("pages.profile.password")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("pages.profile.passwordDesc")}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              {t("common.change")}
            </Button>
          </div>
        </div>

        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">
                  {t("pages.profile.twoFactor")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("pages.profile.twoFactorDesc")}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              {t("common.enable")}
            </Button>
          </div>
        </div>

        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">
                  {t("pages.profile.activeSessions")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("pages.profile.activeSessionsDesc")}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              {t("common.viewAll")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Tab Component
function ActivityTab({ t }: { t: TFunction }) {
  const activities = [
    {
      id: 1,
      action: t("pages.profile.activities.signedIn"),
      details: t("pages.profile.activities.signedInDetails"),
      time: t("pages.profile.timeAgo.hoursAgo", { hours: 2 }),
    },
    {
      id: 2,
      action: t("pages.profile.activities.updatedProfile"),
      details: t("pages.profile.activities.updatedProfileDetails"),
      time: t("pages.profile.timeAgo.dayAgo"),
    },
    {
      id: 3,
      action: t("pages.profile.activities.createdOrganization"),
      details: t("pages.profile.activities.createdOrgDetails"),
      time: t("pages.profile.timeAgo.daysAgo", { days: 3 }),
    },
    {
      id: 4,
      action: t("pages.profile.activities.changedPassword"),
      details: t("pages.profile.activities.changedPasswordDetails"),
      time: t("pages.profile.timeAgo.weekAgo"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("pages.profile.recentActivity")}
        </h2>
        <p className="text-muted-foreground">
          {t("pages.profile.recentActivityDesc")}
        </p>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{activity.action}</p>
              <p className="text-sm text-muted-foreground">
                {activity.details}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default exportWithMainLayout(ProfilePage);
