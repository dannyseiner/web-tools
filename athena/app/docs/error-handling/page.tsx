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

      <DocSection title={t("overview")} id="overview">
        <p>{t("overviewDesc")}</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>{t("overviewItem1")}</li>
          <li>{t("overviewItem2")}</li>
          <li>{t("overviewItem3")}</li>
          <li>{t("overviewItem4")}</li>
        </ul>
      </DocSection>

      <DocSection title={t("installation")} id="installation">
        <p>{t("installationDesc")}</p>
        <CodeBlock language="bash" code={`npm install @uu-webtools/client`} />
        <p className="mt-4">{t("orWithYarn")}</p>
        <CodeBlock language="bash" code={`yarn add @uu-webtools/client`} />
      </DocSection>

      <DocSection title={t("environmentSetup")} id="environment-setup">
        <p>{t("environmentSetupDesc")}</p>
        <CodeBlock
          filename=".env.local"
          language="bash"
          code={`NEXT_PUBLIC_WEBTOOLS_PROJECT_TOKEN=your_project_token_here`}
        />
        <p className="mt-4">{t("environmentSetupNote")}</p>
      </DocSection>

      <DocSection title={t("basicSetup")} id="basic-setup">
        <p>{t("basicSetupDesc")}</p>
        <CodeBlock
          filename="app/layout.tsx"
          language="typescript"
          code={`import { NextErrorProvider, ErrorBoundary } from "@uu-webtools/client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <NextErrorProvider>
          <ErrorBoundary fallback={<p>Something went wrong.</p>}>
            {children}
          </ErrorBoundary>
        </NextErrorProvider>
      </body>
    </html>
  );
}`}
        />
        <p className="mt-4">{t("basicSetupAuto")}</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>{t("basicSetupAuto1")}</li>
          <li>{t("basicSetupAuto2")}</li>
          <li>{t("basicSetupAuto3")}</li>
        </ul>
      </DocSection>

      <DocSection title={t("manualReporting")} id="manual-reporting">
        <p>{t("manualReportingDesc")}</p>
        <CodeBlock
          filename="components/SubmitForm.tsx"
          language="typescript"
          code={`"use client";

import { captureException } from "@uu-webtools/client";

async function handleSubmit(data: FormData) {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      throw new Error(\`Submit failed: \${res.status}\`);
    }
  } catch (error) {
    captureException(error, {
      tags: { action: "form-submit" },
      extra: { formId: "contact-form" },
    });
  }
}`}
        />
      </DocSection>

      <DocSection title={t("errorBoundary")} id="error-boundary">
        <p>{t("errorBoundaryDesc")}</p>
        <CodeBlock
          language="typescript"
          code={`import { ErrorBoundary } from "@uu-webtools/client";

function App() {
  return (
    <ErrorBoundary fallback={<p>Something went wrong.</p>}>
      <MyComponent />
    </ErrorBoundary>
  );
}`}
        />
        <p className="mt-4">{t("errorBoundaryHow")}</p>
      </DocSection>

      <DocSection title={t("viewingErrors")} id="viewing-errors">
        <p>{t("viewingErrorsDesc")}</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>{t("viewingItem1")}</li>
          <li>{t("viewingItem2")}</li>
          <li>{t("viewingItem3")}</li>
          <li>{t("viewingItem4")}</li>
        </ul>
      </DocSection>
    </div>
  );
}
