import { NamespaceKeys, NestedKeyOf, useTranslations } from "next-intl";
import { getRequestConfig } from "next-intl/server";

export const languages = ["en", "cs"] as const;
export const fallbackLanguage = "en";

export type TFunction<
  NestedKey extends NamespaceKeys<string, NestedKeyOf<string>> = never,
> = ReturnType<
  typeof useTranslations<
    NestedKey extends never ? NestedKeyOf<string> : NestedKey
  >
>;

export type Locale = (typeof languages)[number];

export default getRequestConfig(async () => {
  const locale = fallbackLanguage;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
