"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Users,
  Crown,
  Briefcase,
  Loader2,
  Calendar,
} from "lucide-react";
import { motion } from "motion/react";
import { exportWithMainLayout } from "@/modules/core/layouts/main-layout";
import { useTranslations } from "next-intl";

function OrganizationsPage() {
  const router = useRouter();
  const organizations = useQuery(api.organizations.getUserOrganizations);
  const t = useTranslations();

  const getRoleIcon = (role: "Member" | "Manager" | "Admin") => {
    switch (role) {
      case "Admin":
        return <Crown className="h-4 w-4 text-primary" />;
      case "Manager":
        return <Briefcase className="h-4 w-4 text-orange-500" />;
      case "Member":
        return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeClass = (role: "Member" | "Manager" | "Admin") => {
    switch (role) {
      case "Admin":
        return "bg-primary/10 text-primary border-primary/20";
      case "Manager":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      case "Member":
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (organizations === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('pages.organizations.loadingOrganizations')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {t('pages.organizations.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('pages.organizations.subtitle')}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/organizations/create")}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            {t('pages.organizations.createOrganization')}
          </motion.button>
        </motion.div>

        {/* Organizations Grid */}
        {organizations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-card border border-border rounded-xl p-12 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t('pages.organizations.noOrganizationsTitle')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('pages.organizations.noOrganizationsDesc')}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/organizations/create")}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-5 w-5" />
              {t('pages.organizations.createFirstOrg')}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {organizations.map((org, index) => (
              <motion.div
                key={org._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                onClick={() => router.push(`/organizations/${org._id}`)}
                className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 group"
              >
                {/* Organization Image/Icon */}
                <div className="mb-4">
                  {org.image ? (
                    <img
                      src={org.image}
                      alt={org.name}
                      className="w-16 h-16 rounded-xl object-cover border border-border shadow-sm bg-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>

                {/* Organization Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">
                    {org.name}
                  </h3>
                  {org.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {org.description}
                    </p>
                  )}
                </div>

                {/* Role Badge */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${getRoleBadgeClass(org.role)}`}
                  >
                    {getRoleIcon(org.role)}
                    <span>{org.role}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(org._creationTime).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Info Box */}
        {organizations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 bg-gradient-to-br from-primary/5 to-orange-500/5 border border-primary/10 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-3">
              {t('pages.organizations.rolesTitle')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">{t('pages.organizations.adminTitle')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.organizations.adminDesc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">{t('pages.organizations.managerTitle')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.organizations.managerDesc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">{t('pages.organizations.memberTitle')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('pages.organizations.memberDesc')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default exportWithMainLayout(OrganizationsPage);
