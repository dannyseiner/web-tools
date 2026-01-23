"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Languages, ChevronDown, Upload } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

interface ActionsDropdownProps {
  onAddTranslation: () => void;
  onAddLanguage: () => void;
  onUploadJson: () => void;
}

export function ActionsDropdown({
  onAddTranslation,
  onAddLanguage,
  onUploadJson,
}: ActionsDropdownProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
      >
        {t("components.translations.actions")}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50"
          >
            <button
              onClick={() => handleAction(onAddTranslation)}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 border-b border-border"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {t("components.translations.addTranslation")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("components.translations.addTranslationDesc")}
                </p>
              </div>
            </button>

            <button
              onClick={() => handleAction(onAddLanguage)}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3 border-b border-border"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Languages className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {t("components.translations.addLanguage")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("components.translations.addLanguageDesc")}
                </p>
              </div>
            </button>

            <button
              onClick={() => handleAction(onUploadJson)}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Upload className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {t("components.translations.uploadJsonFile")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("components.translations.bulkImport")}
                </p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
