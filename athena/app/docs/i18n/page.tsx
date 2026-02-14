"use client";

import { DocSection } from "@/modules/docs/components/doc-section";
import { useTranslations } from "next-intl";

export default function I18nPage() {
  const t = useTranslations("modules.docs.i18nPage");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
      </div>

      <DocSection title={t("overview")} id="overview">
        <p>{t("overviewDesc")}</p>
      </DocSection>

      <DocSection title={t("setup")} id="setup">
        <p>{t("setupDesc")}</p>
      </DocSection>

      <DocSection title={t("configuration")} id="configuration">
        <p>{t("configurationDesc")}</p>
      </DocSection>

      <DocSection title={t("usage")} id="usage">
        <p>{t("usageDesc")}</p>
      </DocSection>
    </div>
  );
}
