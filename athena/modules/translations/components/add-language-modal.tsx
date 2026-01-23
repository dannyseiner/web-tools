"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { X, Plus, Loader2, CheckCircle2, Languages } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

interface AddLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: Id<"projects">;
  existingLanguages: string[];
}

export function AddLanguageModal({
  isOpen,
  onClose,
  projectId,
  existingLanguages,
}: AddLanguageModalProps) {
  const t = useTranslations();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const allLanguages = useQuery(api.languages.getActiveLanguages);
  const addLanguage = useMutation(api.projectSettings.addLanguage);

  const availableLanguages =
    allLanguages?.filter((lang) => !existingLanguages.includes(lang.code)) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLanguage) return;

    try {
      setLoading(true);
      await addLanguage({
        projectId,
        languageCode: selectedLanguage,
      });

      setSelectedLanguage("");
      onClose();
    } catch (error) {
      console.error("Error adding language:", error);
      alert(error instanceof Error ? error.message : t("components.translations.failedToAddLanguage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Languages className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {t("components.translations.addLanguage")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("components.translations.addLanguageToProject")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {availableLanguages.length === 0 ? (
                  <div className="text-center py-8">
                    <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground font-medium mb-1">
                      {t("components.translations.allLanguagesAdded")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("components.translations.allLanguagesAddedDesc")}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-foreground">
                        {t("components.translations.selectLanguage")}
                      </label>
                      {availableLanguages.map((lang) => (
                        <motion.button
                          key={lang._id}
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
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

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-background hover:bg-accent border border-border text-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {t("common.cancel")}
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !selectedLanguage}
                        className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("components.translations.adding")}
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            {t("components.translations.addLanguage")}
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
