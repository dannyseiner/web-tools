"use client";

import { useTranslation } from "@webtools/client";

export default function I18nDemo() {
  const t = useTranslation("common");
  const tGlobal = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 font-sans dark:bg-black">
      <div className="w-full max-w-2xl">
        <p className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          i18n testing
        </p>
        <p className="mb-6 text-sm text-zinc-500">
          Testing @webtools/i18n package
        </p>

        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <h2 className="mb-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              {'With prefix: useTranslation("common")'}
            </h2>
            <ul className="space-y-1 text-zinc-800 dark:text-zinc-200">
              <li>
                {'t("greeting") → '}
                {t("greeting")}
              </li>
              <li>
                {'t("welcome") → '}
                {t("welcome")}
              </li>
              <li>
                {'t("language") → '}
                {t("language")}
              </li>
              <li>
                {'t("missing.key") → '}
                {t("missing.key")}
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <h2 className="mb-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              {"Without prefix: useTranslation()"}
            </h2>
            <ul className="space-y-1 text-zinc-800 dark:text-zinc-200">
              <li>
                {'t("common.greeting") → '}
                {tGlobal("common.greeting")}
              </li>
              <li>
                {'t("errors.notFound") → '}
                {tGlobal("errors.notFound")}
              </li>
              <li>
                {'t("errors.generic") → '}
                {tGlobal("errors.generic")}
              </li>
              <li>
                {'t("errors.network") → '}
                {tGlobal("errors.network")}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
