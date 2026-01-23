"use client";

// @AI-GENERATED: just for helping purpose - will be deleted on release

import { useAppConfig } from "@/modules/core/lib/app-config";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { CheckCircle2, Database, Languages, Loader2 } from "lucide-react";

const Page = () => {
  const appConfig = useAppConfig();
  const [seedingLanguages, setSeedingLanguages] = useState(false);
  const [migratingProjects, setMigratingProjects] = useState(false);
  const [migratingSettings, setMigratingSettings] = useState(false);
  const [languagesSeeded, setLanguagesSeeded] = useState(false);
  const [projectsMigrated, setProjectsMigrated] = useState(false);
  const [settingsMigrated, setSettingsMigrated] = useState(false);

  const languages = useQuery(api.languages.getAllLanguages);

  const seedLanguages = useMutation(api.seed.seedLanguages);
  const migrateProjects = useMutation(api.seed.migrateProjectsLanguages);
  const migrateSettings = useMutation(
    api.seed.migrateProjectSettingsSupportedLanguages,
  );

  const handleSeedLanguages = async () => {
    try {
      setSeedingLanguages(true);
      await seedLanguages();
      setLanguagesSeeded(true);
      setTimeout(() => setLanguagesSeeded(false), 3000);
    } catch (error) {
      console.error("Error seeding languages:", error);
      alert(
        error instanceof Error ? error.message : "Failed to seed languages",
      );
    } finally {
      setSeedingLanguages(false);
    }
  };

  const handleMigrateProjects = async () => {
    try {
      setMigratingProjects(true);
      await migrateProjects();
      setProjectsMigrated(true);
      setTimeout(() => setProjectsMigrated(false), 3000);
    } catch (error) {
      console.error("Error migrating projects:", error);
      alert(
        error instanceof Error ? error.message : "Failed to migrate projects",
      );
    } finally {
      setMigratingProjects(false);
    }
  };

  const handleMigrateSettings = async () => {
    try {
      setMigratingSettings(true);
      await migrateSettings();
      setSettingsMigrated(true);
      setTimeout(() => setSettingsMigrated(false), 3000);
    } catch (error) {
      console.error("Error migrating settings:", error);
      alert(
        error instanceof Error ? error.message : "Failed to migrate settings",
      );
    } finally {
      setMigratingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Developer Tools
          </h1>
          <p className="text-muted-foreground">
            Utilities for database management and testing
          </p>
        </div>

        {/* Database Utilities */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Database Management
              </h2>
              <p className="text-sm text-muted-foreground">
                Seed data and run migrations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Seed Languages */}
            <div className="border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Languages className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Seed Languages
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Populate the database with 15 common languages (English,
                    Czech, Slovak, etc.)
                  </p>
                  {languages && languages.length > 0 && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Currently {languages.length} languages in database
                    </p>
                  )}
                  <button
                    onClick={handleSeedLanguages}
                    disabled={seedingLanguages || languagesSeeded}
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {seedingLanguages ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Seeding...
                      </>
                    ) : languagesSeeded ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Seeded Successfully!
                      </>
                    ) : (
                      "Seed Languages"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Migrate Projects */}
            <div className="border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-orange-500 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Migrate Projects
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add projectSettings entries for existing projects
                  </p>
                  <button
                    onClick={handleMigrateProjects}
                    disabled={migratingProjects || projectsMigrated}
                    className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {migratingProjects ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Migrating...
                      </>
                    ) : projectsMigrated ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Migrated Successfully!
                      </>
                    ) : (
                      "Migrate Projects"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Migrate Project Settings */}
            <div className="border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-blue-500 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Migrate Settings
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add supportedLanguages field to existing projectSettings
                  </p>
                  <button
                    onClick={handleMigrateSettings}
                    disabled={migratingSettings || settingsMigrated}
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {migratingSettings ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Migrating...
                      </>
                    ) : settingsMigrated ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Migrated Successfully!
                      </>
                    ) : (
                      "Migrate Settings"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Config */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">
            Application Config
          </h2>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(appConfig, null, 2)}
          </pre>
        </div>

        {/* Languages List */}
        {languages && languages.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              Languages in Database ({languages.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {languages.map((lang) => (
                <div
                  key={lang._id}
                  className="border border-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {lang.nativeName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lang.name} ({lang.code})
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      lang.isActive
                        ? "bg-green-500/10 text-green-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {lang.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
