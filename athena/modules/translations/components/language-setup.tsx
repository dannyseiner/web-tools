"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Languages, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface LanguageSetupProps {
  projectId: Id<"projects">;
  onComplete: () => void;
}

export function LanguageSetup({ projectId, onComplete }: LanguageSetupProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const languages = useQuery(api.languages.getActiveLanguages);
  const updateSettings = useMutation(api.projectSettings.updateProjectSettings);

  const handleSetup = async () => {
    if (!selectedLanguage) return;

    try {
      setLoading(true);
      await updateSettings({
        projectId,
        defaultLanguage: selectedLanguage,
      });
      onComplete();
    } catch (error) {
      console.error("Error setting default language:", error);
      alert(error instanceof Error ? error.message : "Failed to set language");
    } finally {
      setLoading(false);
    }
  };

  if (languages === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Languages className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Setup Default Language
            </h2>
            <p className="text-muted-foreground">
              Choose the primary language for this project
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {languages?.map((lang) => (
            <motion.button
              key={lang._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selectedLanguage === lang.code
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    {lang.nativeName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {lang.name} ({lang.code})
                  </p>
                </div>
                {selectedLanguage === lang.code && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSetup}
          disabled={!selectedLanguage || loading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Setting up...
            </>
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
