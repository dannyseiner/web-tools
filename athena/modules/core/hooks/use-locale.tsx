"use client";

import { useState } from "react";
import { Locale, languages, fallbackLanguage } from "@/lib/i18n";

const LOCALE_STORAGE_KEY = "athena-locale";

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return fallbackLanguage;
    }
    const storedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
    if (storedLocale && languages.includes(storedLocale)) {
      return storedLocale;
    }
    return fallbackLanguage;
  });

  const [isLoading] = useState(false);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    window.location.reload();
  };

  return {
    locale,
    setLocale,
    isLoading,
    languages,
  };
}
