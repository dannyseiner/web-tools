"use client";

import { DocSection } from "@/modules/docs/components/doc-section";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function DocsPage() {
  const t = useTranslations("modules.docs.gettingStarted");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
      </div>

      <DocSection title={t("overview")} id="overview">
        <p>{t("overviewDesc")}</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>{t("overviewItem1")}</li>
          <li>{t("overviewItem2")}</li>
          <li>{t("overviewItem3")}</li>
          <li>{t("overviewItem4")}</li>
        </ul>
      </DocSection>

      <DocSection title={t("quickLinks")} id="quick-links">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/docs/authentication"
            className="group p-6 border border-border rounded-lg hover:border-primary transition-colors"
          >
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              {t("authTitle")}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-sm text-muted-foreground">{t("authDesc")}</p>
          </Link>

          <Link
            href="/docs/error-handling"
            className="group p-6 border border-border rounded-lg hover:border-primary transition-colors"
          >
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              {t("errorTitle")}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-sm text-muted-foreground">{t("errorDesc")}</p>
          </Link>
        </div>
      </DocSection>

      <DocSection title={t("prerequisites")} id="prerequisites">
        <p>{t("prerequisitesDesc")}</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>{t("prerequisiteItem1")}</li>
          <li>{t("prerequisiteItem2")}</li>
          <li>{t("prerequisiteItem3")}</li>
          <li>{t("prerequisiteItem4")}</li>
        </ul>
      </DocSection>
    </div>
  );
}
