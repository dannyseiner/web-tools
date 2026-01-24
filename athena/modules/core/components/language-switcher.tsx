"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/modules/core/hooks/use-locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/ui/select";

export type Language = "en" | "cs";

const languageNames: Record<Language, { native: string; english: string }> = {
  en: { native: "English", english: "English" },
  cs: { native: "Čeština", english: "Czech" },
};

export function LanguageSwitcher() {
  const { locale, setLocale, isLoading } = useLocale();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/50 animate-pulse">
        <Languages className="h-4 w-4 text-muted-foreground" />
        <div className="h-4 w-16 bg-muted-foreground/20 rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <Select
        value={locale}
        onValueChange={(value) => setLocale(value as Language)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            {languageNames[locale]?.native || locale.toUpperCase()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(languageNames).map(([code, names]) => (
            <SelectItem key={code} value={code}>
              <div className="flex items-center justify-between w-full gap-4">
                <span>{names.native}</span>
                <span className="text-xs text-muted-foreground">
                  {code.toUpperCase()}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
