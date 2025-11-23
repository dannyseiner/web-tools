import { getRequestConfig } from "next-intl/server";

export const languages = ["en", "cs"] as const;
export const fallbackLanguage = "en";

export type Locale = (typeof languages)[number];

export default getRequestConfig(async () => {
  const locale = fallbackLanguage;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
