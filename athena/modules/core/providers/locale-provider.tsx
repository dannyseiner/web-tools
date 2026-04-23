"use client";

import { useState, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { Locale, fallbackLanguage } from "@/lib/i18n";

const LOCALE_STORAGE_KEY = "athena-locale";

interface LocaleProviderProps {
  children: React.ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocale] = useState<Locale>(fallbackLanguage);
  const [messages, setMessages] = useState<Record<string, unknown> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        const storedLocale =
          (localStorage.getItem(LOCALE_STORAGE_KEY) as Locale) ||
          fallbackLanguage;
        setLocale(storedLocale);

        const loadedMessages = await import(`@/messages/${storedLocale}.json`);
        setMessages(loadedMessages.default);
      } catch (error) {
        console.error("Failed to load messages:", error);
        const fallbackMessages = await import(
          `@/messages/${fallbackLanguage}.json`
        );
        setMessages(fallbackMessages.default);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, []);

  if (isLoading || !messages) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
