"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { X, Upload, Loader2, AlertTriangle, CheckCircle2, FileJson } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { FileUpload } from "@/modules/core/components/file-upload";

interface UploadTranslationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: Id<"projects">;
  languageCode: string;
}

interface ParsedTranslation {
  key: string;
  value: string;
  namespace?: string;
  description?: string;
  isOverride: boolean;
}

export function UploadTranslationsModal({
  isOpen,
  onClose,
  projectId,
  languageCode,
}: UploadTranslationsModalProps) {
  const t = useTranslations();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedTranslation[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingTranslations = useQuery(api.translations.getProjectTranslations, {
    projectId,
    languageCode,
  });

  const upsert = useMutation(api.translations.upsertTranslation);

  const existingKeys = useMemo(
    () => new Set(existingTranslations?.map((t) => t.key) || []),
    [existingTranslations]
  );

  const stats = useMemo(() => {
    const newCount = parsedData.filter((t) => !t.isOverride).length;
    const overrideCount = parsedData.filter((t) => t.isOverride).length;
    return { newCount, overrideCount, total: parsedData.length };
  }, [parsedData]);

  const parseJSON = (content: string): ParsedTranslation[] => {
    try {
      const json = JSON.parse(content);
      const translations: ParsedTranslation[] = [];

      const flattenObject = (
        obj: any,
        prefix: string = "",
        namespace?: string
      ) => {
        for (const key in obj) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          const value = obj[key];

          if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            flattenObject(value, fullKey, namespace || key);
          } else if (typeof value === "string") {
            translations.push({
              key: fullKey,
              value,
              namespace: namespace,
              isOverride: existingKeys.has(fullKey),
            });
          }
        }
      };

      flattenObject(json);
      return translations;
    } catch (err) {
      throw new Error(t("components.translations.invalidJsonFormat"));
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);

    try {
      const content = await selectedFile.text();
      const parsed = parseJSON(content);

      if (parsed.length === 0) {
        setError(t("components.translations.noTranslationsFound"));
        return;
      }

      setParsedData(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("components.translations.failedToParseFile"));
      setParsedData([]);
    }
  };

  const handleSubmit = async () => {
    if (parsedData.length === 0) return;

    try {
      setIsUploading(true);

      for (const translation of parsedData) {
        await upsert({
          projectId,
          languageCode,
          key: translation.key,
          value: translation.value,
          namespace: translation.namespace,
          description: translation.description,
        });
      }

      onClose();
      setFile(null);
      setParsedData([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("components.translations.failedToUpload"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDiscard = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
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
              className="bg-card border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileJson className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {t("components.translations.uploadJsonFile")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t("components.translations.bulkImportTranslations")} {languageCode.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={isUploading}
                  className="p-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {!file && (
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    accept=".json"
                    maxSize={10}
                  />
                )}

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-destructive">
                        {t("components.translations.error")}
                      </p>
                      <p className="text-sm text-destructive/80">{error}</p>
                    </div>
                  </div>
                )}

                {parsedData.length > 0 && (
                  <>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">
                          {t("components.translations.preview")}
                        </h3>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600 dark:text-green-500">
                            <CheckCircle2 className="h-4 w-4 inline mr-1" />
                            {stats.newCount} {t("components.translations.new")}
                          </span>
                          <span className="text-orange-600 dark:text-orange-500">
                            <AlertTriangle className="h-4 w-4 inline mr-1" />
                            {stats.overrideCount} {t("components.translations.overrides")}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("components.translations.totalTranslationsToImport", { count: stats.total })}
                      </p>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {parsedData.map((translation, index) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-3 ${
                            translation.isOverride
                              ? "border-orange-500/30 bg-orange-500/5"
                              : "border-border bg-card"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
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
                              <p className="text-sm text-muted-foreground break-words">
                                {translation.value}
                              </p>
                            </div>
                            {translation.isOverride && (
                              <span className="text-xs text-orange-600 dark:text-orange-500 font-medium whitespace-nowrap">
                                {t("components.translations.willOverride")}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {parsedData.length > 0 && (
                <div className="border-t border-border p-6 flex gap-3">
                  <button
                    onClick={handleDiscard}
                    disabled={isUploading}
                    className="flex-1 px-4 py-2 bg-background hover:bg-accent border border-border text-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {t("components.translations.discard")}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isUploading}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("components.translations.importing")}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        {t("components.translations.importTranslations")}
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
