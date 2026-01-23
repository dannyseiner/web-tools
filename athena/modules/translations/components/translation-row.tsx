"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Edit2, Save, X, User, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

interface TranslationRowProps {
  translation: {
    _id: Id<"translations">;
    key: string;
    value: string;
    namespace?: string;
    description?: string;
    projectId?: Id<"projects">;
    languageCode?: string;
  };
  isEditing?: boolean;
  editorInfo?: {
    userName: string | null;
    userEmail: string | null;
  };
  onStartEdit: () => void;
  onStopEdit: () => void;
}

export function TranslationRow({
  translation,
  isEditing: externallyEditing,
  editorInfo,
  onStartEdit,
  onStopEdit,
}: TranslationRowProps) {
  const t = useTranslations();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(translation.value || "");
  const [description, setDescription] = useState(translation.description || "");
  const [quickValue, setQuickValue] = useState("");
  const [isSavingQuick, setIsSavingQuick] = useState(false);

  const upsert = useMutation(api.translations.upsertTranslation);
  const startEditing = useMutation(api.translationEditors.startEditing);
  const stopEditing = useMutation(api.translationEditors.stopEditing);

  useEffect(() => {
    setValue(translation.value || "");
    setDescription(translation.description || "");
  }, [translation]);

  const handleStartEdit = async () => {
    setIsEditing(true);
    onStartEdit();

    if (translation.value) {
      await startEditing({ translationId: translation._id });
    }
  };

  const handleCancelEdit = async () => {
    setIsEditing(false);
    setValue(translation.value || "");
    setDescription(translation.description || "");
    onStopEdit();

    // Only stop editing if we have a valid translation ID
    if (translation.value) {
      await stopEditing({ translationId: translation._id });
    }
  };

  const handleSave = async () => {
    try {
      await upsert({
        projectId: translation.projectId as Id<"projects">,
        languageCode: translation.languageCode as string,
        key: translation.key,
        value,
        namespace: translation.namespace,
        description: description || undefined,
      });
      setIsEditing(false);
      onStopEdit();

      if (translation.value) {
        await stopEditing({ translationId: translation._id });
      }
    } catch (error) {
      console.error("Error saving translation:", error);
      alert("Failed to save translation");
    }
  };

  const handleQuickSave = async () => {
    if (
      !quickValue.trim() ||
      !translation.projectId ||
      !translation.languageCode
    )
      return;

    try {
      setIsSavingQuick(true);
      await upsert({
        projectId: translation.projectId,
        languageCode: translation.languageCode,
        key: translation.key,
        value: quickValue,
        namespace: translation.namespace,
        description: translation.description,
      });
      setQuickValue("");
    } catch (error) {
      console.error("Error saving translation:", error);
      alert(t("components.translations.errorSaving"));
    } finally {
      setIsSavingQuick(false);
    }
  };

  const isDisabled = externallyEditing || isEditing;
  const isEmpty = !translation.value;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-card border rounded-lg p-4 ${
        externallyEditing
          ? "ring-2 ring-orange-500/50 border-orange-500/50"
          : isEmpty
            ? "border-orange-500/30"
            : "border-border"
      }`}
    >
      {externallyEditing && editorInfo && (
        <div className="flex items-center gap-2 mb-3 text-sm text-orange-600 bg-orange-500/10 px-3 py-1.5 rounded">
          <User className="h-4 w-4" />
          <span>
            {editorInfo.userName ||
              editorInfo.userEmail ||
              t("components.translations.someone")}{" "}
            {t("components.translations.isEditing")}
          </span>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {translation.namespace && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {translation.namespace}
                </span>
              )}
              <code className="text-sm font-mono text-foreground">
                {translation.key}
              </code>
            </div>
            {translation.description && !isEditing && (
              <p className="text-xs text-muted-foreground">
                {translation.description}
              </p>
            )}
          </div>
          {!isEditing && !externallyEditing && (
            <button
              onClick={handleStartEdit}
              className="p-2 hover:bg-accent rounded transition-colors"
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              placeholder={t("components.translations.valuePlaceholder")}
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("components.translations.descriptionPlaceholder")}
              className="w-full px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors text-sm font-medium"
              >
                <Save className="h-4 w-4" />
                {t("common.save")}
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-background hover:bg-accent border border-border text-foreground rounded transition-colors text-sm"
              >
                <X className="h-4 w-4" />
                {t("common.cancel")}
              </button>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 py-2 px-3 bg-orange-500/5 border border-orange-500/20 rounded">
              <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
              <span className="text-orange-600 dark:text-orange-500 font-medium">
                {t("components.translations.missingTranslation")}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                value={quickValue}
                onChange={(e) => setQuickValue(e.target.value)}
                placeholder={t("components.translations.quickAddPlaceholder")}
                disabled={isSavingQuick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleQuickSave();
                  }
                }}
                className="flex-1 px-3 py-2 bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground disabled:opacity-50"
              />
              <button
                onClick={handleQuickSave}
                disabled={!quickValue.trim() || isSavingQuick}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSavingQuick ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("components.translations.saving")}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t("components.translations.addQuick")}
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-foreground whitespace-pre-wrap wrap-break-words">
            {value}
          </p>
        )}
      </div>
    </motion.div>
  );
}
