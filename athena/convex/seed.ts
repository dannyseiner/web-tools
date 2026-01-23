import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// @AI-GENERATED: just for helping purpose - will be deleted on release

export const migrateProjectsLanguages = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const projects = await ctx.db.query("projects").collect();

    let migratedCount = 0;
    let cleanedCount = 0;

    for (const project of projects) {
      // Clean up old fields from projects table if they exist
      const projectData = project as Record<string, unknown>;
      if (
        "defaultLanguage" in projectData ||
        "supportedLanguages" in projectData
      ) {
        // Replace the entire document without the old fields
        await ctx.db.replace(project._id, {
          organizationId: project.organizationId,
          name: project.name,
          description: project.description,
          image: project.image,
          createdBy: project.createdBy,
        });
        cleanedCount++;
      }

      // Check if project already has settings
      const existingSettings = await ctx.db
        .query("projectSettings")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .first();

      if (!existingSettings) {
        await ctx.db.insert("projectSettings", {
          projectId: project._id,
          defaultLanguage: undefined,
          supportedLanguages: [],
        });
        migratedCount++;
      }
    }

    console.log(
      `Cleaned ${cleanedCount} projects, migrated ${migratedCount} projects with empty project settings`,
    );
    return null;
  },
});

export const seedLanguages = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("User must be authenticated");
    }

    const existingLanguages = await ctx.db.query("languages").collect();

    if (existingLanguages.length > 0) {
      console.log("Languages already seeded");
      return null;
    }

    const languages = [
      {
        name: "English",
        code: "en",
        nativeName: "English",
        isActive: true,
      },
      {
        name: "Czech",
        code: "cs",
        nativeName: "Čeština",
        isActive: true,
      },
      {
        name: "Slovak",
        code: "sk",
        nativeName: "Slovenčina",
        isActive: true,
      },
      {
        name: "German",
        code: "de",
        nativeName: "Deutsch",
        isActive: true,
      },
      {
        name: "Spanish",
        code: "es",
        nativeName: "Español",
        isActive: true,
      },
      {
        name: "French",
        code: "fr",
        nativeName: "Français",
        isActive: true,
      },
      {
        name: "Italian",
        code: "it",
        nativeName: "Italiano",
        isActive: true,
      },
      {
        name: "Portuguese",
        code: "pt",
        nativeName: "Português",
        isActive: true,
      },
      {
        name: "Polish",
        code: "pl",
        nativeName: "Polski",
        isActive: true,
      },
      {
        name: "Dutch",
        code: "nl",
        nativeName: "Nederlands",
        isActive: true,
      },
      {
        name: "Russian",
        code: "ru",
        nativeName: "Русский",
        isActive: true,
      },
      {
        name: "Japanese",
        code: "ja",
        nativeName: "日本語",
        isActive: true,
      },
      {
        name: "Chinese (Simplified)",
        code: "zh",
        nativeName: "简体中文",
        isActive: true,
      },
      {
        name: "Korean",
        code: "ko",
        nativeName: "한국어",
        isActive: true,
      },
      {
        name: "Arabic",
        code: "ar",
        nativeName: "العربية",
        isActive: true,
      },
    ];

    for (const language of languages) {
      await ctx.db.insert("languages", language);
    }

    console.log(`Seeded ${languages.length} languages`);
    return null;
  },
});

// Migration to add supportedLanguages to existing projectSettings
export const migrateProjectSettingsSupportedLanguages = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const allSettings = await ctx.db.query("projectSettings").collect();
    let migratedCount = 0;

    for (const settings of allSettings) {
      // Check if supportedLanguages field exists
      if (!("supportedLanguages" in settings) || !settings.supportedLanguages) {
        await ctx.db.patch(settings._id, {
          supportedLanguages: settings.defaultLanguage
            ? [settings.defaultLanguage]
            : [],
        });
        migratedCount++;
      }
    }

    console.log(
      `Migrated ${migratedCount} project settings to include supportedLanguages`,
    );
    return null;
  },
});
