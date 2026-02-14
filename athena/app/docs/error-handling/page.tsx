"use client";

import { DocSection } from "@/modules/docs/components/doc-section";
import { CodeBlock } from "@/modules/docs/components/code-block";
import { useTranslations } from "next-intl";

export default function ErrorHandlingPage() {
  const t = useTranslations("modules.docs.errorHandling");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground">{t("subtitle")}</p>
      </div>

      <DocSection title={t("installation")} id="installation">
        <p>{t("installationDesc")}</p>
        <CodeBlock language="bash" code={`npm install @web-tools/ddee`} />
        <p className="mt-4">{t("orWithYarn")}</p>
        <CodeBlock language="bash" code={`yarn add @web-tools/ddee`} />
      </DocSection>

      <DocSection title={t("usage")} id="usage">
        <p className="mb-4">{t("usageDesc")}</p>
        <CodeBlock
          filename="app/layout.tsx"
          language="typescript"
          code={`import { WebToolsLayout } from '@web-tools/ddee';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <WebToolsLayout projectToken={process.env.WEBTOOLS_PROJECT_TOKEN}>
      {children}
    </WebToolsLayout>
  );
}`}
        />
      </DocSection>
    </div>
  );
}
