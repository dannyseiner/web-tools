"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageFilterProps {
  languages: Language[];
  selectedLanguage: string;
  onLanguageChange: (code: string) => void;
}

export function LanguageFilter({
  languages,
  selectedLanguage,
  onLanguageChange,
}: LanguageFilterProps) {
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

  const selectedLang = languages.find((l) => l.code === selectedLanguage);

  const handleSelect = (code: string) => {
    onLanguageChange(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2 min-w-[200px]"
      >
        <span className="flex-1 text-left font-medium text-foreground">
          {selectedLang?.nativeName || "Select Language"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 max-h-[300px] overflow-y-auto"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center justify-between border-b border-border last:border-b-0"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {lang.nativeName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lang.name} ({lang.code})
                  </p>
                </div>
                {selectedLanguage === lang.code && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
