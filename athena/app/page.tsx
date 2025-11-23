"use client";

import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-6">
      <p>{t("config.appName")}</p>
    </div>
  );
}
