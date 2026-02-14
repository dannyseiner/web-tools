"use client";

import { DocSection } from "@/modules/docs/components/doc-section";
import { useTranslations } from "next-intl";
import { PUBLIC_API_ROUTES } from "@/modules/api/constants";
import { CodeBlock } from "@/modules/docs/components/code-block";

export default function AuthenticationPage() {
  const t = useTranslations("modules.docs.authentication");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
      </div>

      <DocSection title={t("sectionGetToken")} id="getting-token">
        <p>{t("getTokenInSettings")}</p>
      </DocSection>

      <DocSection title={t("sectionRequire")} id="require-token">
        <p className="mb-4">{t("requireToken")}</p>
        <p className="text-sm text-muted-foreground mb-2">
          {t("headerName")}:{" "}
          <code className="bg-muted px-2 py-1 rounded">X-Project-Token</code>
        </p>
        <CodeBlock
          language="typescript"
          code={`const response = await fetch('${PUBLIC_API_ROUTES.languages.get}', {
  headers: {
    'X-Project-Token': 'your_project_token_here'
  }
});`}
        />
      </DocSection>

      <DocSection title={t("errorsTitle")} id="errors">
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>
            <strong>401</strong> — {t("error401Missing")}
          </li>
          <li>
            <strong>401</strong> — {t("error401Invalid")}
          </li>
        </ul>
      </DocSection>
    </div>
  );
}
