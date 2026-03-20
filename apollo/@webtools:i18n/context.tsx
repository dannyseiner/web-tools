"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";

const DEFAULT_DSN = "https://web-tools-ashen.vercel.app/api/errors";

type Messages = Record<string, unknown>;

export type MissingTranslationInfo = {
  key: string;
  locale: string;
};

type I18nContextValue = {
  locale: string;
  messages: Messages;
  projectToken: string;
  dsn: string;
  onMissingTranslation?: (info: MissingTranslationInfo) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export type I18nProviderProps = {
  locale: string;
  messages: Messages;
  projectToken: string;
  dsn?: string;
  children: React.ReactNode;
  onMissingTranslation?: (info: MissingTranslationInfo) => void;
};

export function I18nProvider({
  locale,
  messages,
  projectToken,
  dsn,
  children,
  onMissingTranslation,
}: I18nProviderProps) {
  const value = useMemo(
    () => ({
      locale,
      messages,
      projectToken,
      dsn: dsn ?? DEFAULT_DSN,
      onMissingTranslation,
    }),
    [locale, messages, projectToken, dsn, onMissingTranslation],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function resolve(obj: unknown, path: string): string | null {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return null;
    }
    current = (current as Record<string, unknown>)[key];
  }

  if (typeof current === "string") return current;
  if (typeof current === "number" || typeof current === "boolean")
    return String(current);
  return null;
}

function reportMissingTranslation(
  dsn: string,
  projectToken: string,
  key: string,
  locale: string,
) {
  const payload = {
    name: "MissingTranslation",
    message: `Missing translation: "${key}" [${locale}]`,
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : undefined,
    projectToken,
    tags: { source: "i18n" },
    extra: { key, locale },
  };

  try {
    fetch(dsn, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Project-Token": projectToken,
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {}
}

export function useTranslation(prefix?: string) {
  const ctx = useContext(I18nContext);

  if (!ctx) {
    throw new Error("useTranslation must be used within an <I18nProvider>");
  }

  const reportedKeys = useRef<Set<string>>(new Set());

  const t = useCallback(
    (key: string): string => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = resolve(ctx.messages, fullKey);

      if (value !== null) return value;

      if (!reportedKeys.current.has(fullKey)) {
        reportedKeys.current.add(fullKey);

        console.error(
          `[@webtools/i18n] Missing translation for key "${fullKey}" in locale "${ctx.locale}"`,
        );

        reportMissingTranslation(
          ctx.dsn,
          ctx.projectToken,
          fullKey,
          ctx.locale,
        );

        ctx.onMissingTranslation?.({ key: fullKey, locale: ctx.locale });
      }

      return fullKey;
    },
    [ctx, prefix],
  );

  return t;
}
