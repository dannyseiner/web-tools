"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Building2,
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
import {
  UserOrganization,
  UserOrganizations,
  UserProfile,
} from "@/lib/convex-types";

type TabType =
  | "organizations"
  | "settings"
  | "security"
  | "activity"
  | "logout";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("organizations");
  const { signOut } = useAuthActions();
  const profile = useQuery(api.profile.getProfile);
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const { setLoading } = useLoader();

  const handleTabChange = async (tab: TabType) => {
    if (tab === "logout") {
      setLoading({
        loading: true,
        title: "Signing out...",
      });
      await signOut();
      setLoading({
        loading: false,
        title: "Signed out",
        description: "You have been signed out successfully",
        state: "success",
      });
      router.push("/auth");
    } else {
      setActiveTab(tab);
    }
  };

  const tabs = [
    {
      id: "organizations" as TabType,
      label: "Organizations",
      icon: Building2,
    },
    {
      id: "settings" as TabType,
      label: "Settings",
      icon: Settings,
    },
    {
      id: "security" as TabType,
      label: "Security",
      icon: Shield,
    },
    {
      id: "activity" as TabType,
      label: "Activity",
      icon: Activity,
    },
    {
      id: "logout" as TabType,
      label: "Logout",
      icon: LogOut,
    },
  ];

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
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
            Not Logged In
          </h2>
          <p className="text-muted-foreground mb-6">
            Please log in to view your profile
          </p>
          <Button onClick={() => router.push("/auth")}>Go to Login</Button>
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
          Back
        </motion.button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          {/* Cover Image */}
          <div className="h-32 bg-linear-to-r from-primary via-orange-500 to-pink-500" />

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
                      Joined{" "}
                      {new Date(profile._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  Share Profile
                </Button>
                <Button size="sm">Edit Profile</Button>
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
                    onClick={() => handleTabChange(tab.id)}
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
                {activeTab === "organizations" && (
                  <OrganizationsTab organizations={organizations ?? []} />
                )}
                {activeTab === "settings" && <SettingsTab profile={profile} />}
                {activeTab === "security" && <SecurityTab />}
                {activeTab === "activity" && <ActivityTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Organizations Tab Component
function OrganizationsTab({
  organizations,
}: {
  organizations: UserOrganizations;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          My Organizations
        </h2>
        <p className="text-muted-foreground">Organizations youre a member of</p>
      </div>

      {organizations === undefined ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No organizations yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Create or join an organization to get started
          </p>
          <Button>Create Organization</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {organizations.map((org: UserOrganization) => (
            <motion.div
              key={org._id}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 p-4 border border-border rounded-lg hover:shadow-md transition-all cursor-pointer"
            >
              {org.image ? (
                <img
                  src={org.image}
                  alt={org.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-linear-to-br from-primary to-orange-600 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{org.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {org.description || "No description"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {org.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ profile }: { profile: UserProfile }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Profile Settings
        </h2>
        <p className="text-muted-foreground">
          Update your personal information
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Full Name
          </label>
          <Input
            placeholder="Enter your name"
            defaultValue={profile.name || ""}
            icon={{ name: User, position: "left" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="Enter your email"
            defaultValue={profile.email || ""}
            icon={{ name: Mail, position: "left" }}
            disabled
          />
          <p className="text-xs text-muted-foreground mt-1">
            Email cannot be changed
          </p>
        </div>

        <div className="pt-4">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

// Security Tab Component
function SecurityTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Security Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your account security and privacy
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">Password</h3>
                <p className="text-sm text-muted-foreground">
                  Last changed 30 days ago
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>
        </div>

        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
        </div>

        <div className="p-4 border border-border rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">
                  Active Sessions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage your active sessions
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Tab Component
function ActivityTab() {
  const activities = [
    {
      id: 1,
      action: "Created organization",
      details: "Acme Corporation",
      time: "2 hours ago",
    },
    {
      id: 2,
      action: "Updated profile",
      details: "Changed profile picture",
      time: "1 day ago",
    },
    {
      id: 3,
      action: "Joined organization",
      details: "Tech Startups Inc",
      time: "3 days ago",
    },
    {
      id: 4,
      action: "Changed password",
      details: "Security update",
      time: "1 week ago",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Recent Activity
        </h2>
        <p className="text-muted-foreground">Your recent actions and updates</p>
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
