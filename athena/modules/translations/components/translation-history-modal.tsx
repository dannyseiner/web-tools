"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { X, History, Loader2, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface TranslationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  translationId: Id<"translations">;
  translationKey: string;
}

export function TranslationHistoryModal({
  isOpen,
  onClose,
  translationId,
  translationKey,
}: TranslationHistoryModalProps) {
  const t = useTranslations();

  const history = useQuery(
    api.translations.getTranslationHistory,
    isOpen ? { translationId } : "skip",
  );

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
              className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-foreground truncate">
                      {t("components.translations.editHistory")}
                    </h2>
                    <code className="text-sm font-mono text-muted-foreground truncate block">
                      {translationKey}
                    </code>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-accent rounded-lg transition-colors shrink-0"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {history === undefined ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <History className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      {t("components.translations.noHistory")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((entry) => (
                      <div
                        key={entry._id}
                        className="border border-border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            {entry.changedByUser?.image ? (
                              <Image
                                src={entry.changedByUser.image}
                                alt={entry.changedByUser.name ?? ""}
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-foreground truncate">
                              {entry.changedByUser?.name ??
                                entry.changedByUser?.email ??
                                t("components.translations.someone")}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {new Date(entry._creationTime).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-start gap-2 text-sm">
                          <div className="flex-1 min-w-0 bg-destructive/5 border border-destructive/20 rounded px-3 py-2">
                            <p className="text-xs text-muted-foreground mb-1">
                              {t("components.translations.before")}
                            </p>
                            <p className="text-foreground whitespace-pre-wrap wrap-break-words">
                              {entry.oldValue || (
                                <span className="text-muted-foreground italic">
                                  {t("components.translations.empty")}
                                </span>
                              )}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground mt-7 shrink-0" />
                          <div className="flex-1 min-w-0 bg-primary/5 border border-primary/20 rounded px-3 py-2">
                            <p className="text-xs text-muted-foreground mb-1">
                              {t("components.translations.after")}
                            </p>
                            <p className="text-foreground whitespace-pre-wrap wrap-break-words">
                              {entry.newValue || (
                                <span className="text-muted-foreground italic">
                                  {t("components.translations.empty")}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
