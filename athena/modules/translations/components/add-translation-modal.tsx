"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { X, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

interface AddTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: Id<"projects">;
  languageCode: string;
}

export function AddTranslationModal({
  isOpen,
  onClose,
  projectId,
  languageCode,
}: AddTranslationModalProps) {
  const t = useTranslations();
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [namespace, setNamespace] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const upsert = useMutation(api.translations.upsertTranslation);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) return;

    try {
      setLoading(true);
      await upsert({
        projectId,
        languageCode,
        key: key.trim(),
        value: value.trim(),
        namespace: namespace.trim() || undefined,
        description: description.trim() || undefined,
      });
      
      // Reset form
      setKey("");
      setValue("");
      setNamespace("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error adding translation:", error);
      alert(error instanceof Error ? error.message : "Failed to add translation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {t("components.translations.addTranslation")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("components.translations.createNewTranslation")} {languageCode.toUpperCase()}
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Key */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("components.translations.translationKey")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder={t("components.translations.keyPlaceholder")}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("components.translations.keyHint")}
                  </p>
                </div>

                {/* Namespace */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("components.translations.namespace")}
                  </label>
                  <input
                    type="text"
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    placeholder={t("components.translations.namespacePlaceholder")}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("components.translations.namespaceHint")}
                  </p>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("components.translations.value")} <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={t("components.translations.valuePlaceholder")}
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("components.translations.description")}
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("components.translations.descriptionPlaceholder")}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("components.translations.descriptionHint")}
                  </p>
                </div>

                {/* Actions */}
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
                    disabled={loading || !key.trim() || !value.trim()}
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
                        {t("components.translations.addTranslation")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
