"use client";

import { useTranslation } from "@webtools/client";

export default function Home() {
  const t = useTranslation("common");

  const triggerError = () => {
    throw new Error("Test error from hermes");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("greeting")}
        </h1>
        <p className="mb-6 text-zinc-500">{t("welcome")}</p>
        <button
          type="button"
          onClick={triggerError}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          {t("triggerError")}
        </button>
        <p>{t("missing.key.test.api-report")}</p>
      </div>
    </div>
  );
}
