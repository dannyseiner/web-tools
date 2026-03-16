"use client";

import React, { createContext, useContext, useCallback, useMemo } from "react";

type Messages = Record<string, unknown>;

type I18nContextValue = {
  locale: string;
  messages: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export type I18nProviderProps = {
  locale: string;
  messages: Messages;
  children: React.ReactNode;
};

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function resolve(obj: unknown, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return path;
    }
    current = (current as Record<string, unknown>)[key];
  }

  if (typeof current === "string") return current;
  if (typeof current === "number" || typeof current === "boolean") return String(current);
  return path;
}

export function useTranslation(prefix?: string) {
  const ctx = useContext(I18nContext);

  if (!ctx) {
    throw new Error("useTranslation must be used within an <I18nProvider>");
  }

  const t = useCallback(
    (key: string): string => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      return resolve(ctx.messages, fullKey);
    },
    [ctx.messages, prefix],
  );

  return t;
}
