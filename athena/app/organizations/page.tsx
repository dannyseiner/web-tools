"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  Users,
  Crown,
  Briefcase,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";

export default function OrganizationsPage() {
  const router = useRouter();
  const organizations = useQuery(api.organizations.getUserOrganizations);

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
          <p className="text-muted-foreground">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Organizations
          </h1>
          <p className="text-muted-foreground">
            Manage your organizations and teams
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/organizations/create")}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          Create Organization
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
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            No organizations yet
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first organization to start collaborating with your team
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/organizations/create")}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            Create Your First Organization
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
              whileHover={{ scale: 1.02, y: -4 }}
              onClick={() => router.push(`/organizations/${org._id}`)}
              className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all group"
            >
              {/* Organization Icon/Image */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {org.image ? (
                    <img
                      src={org.image}
                      alt={org.name}
                      className="w-14 h-14 rounded-xl object-cover border border-border bg-white"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-md">
                      <Building2 className="h-7 w-7 text-white" />
                    </div>
                  )}
                </div>
                {/* Role Badge */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${getRoleBadgeClass(org.role)}`}
                >
                  {getRoleIcon(org.role)}
                  <span>{org.role}</span>
                </div>
              </div>

              {/* Organization Info */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {org.name}
                </h3>
                {org.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {org.description}
                  </p>
                )}
              </div>

              {/* Created Date */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Created {new Date(org._creationTime).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
