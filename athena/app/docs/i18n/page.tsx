"use client";

import { DocSection } from "@/modules/docs/components/doc-section";
import { CodeBlock } from "@/modules/docs/components/code-block";
import { useTranslations } from "next-intl";
import Link from "next/link";

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

      <DocSection title={t("fileStructure")} id="file-structure">
        <p>{t("fileStructureDesc")}</p>
        <CodeBlock
          language="text"
          code={`your-app/
├── messages/
│   ├── en/
│   │   └── common.json
│   └── cs/
│       └── common.json
├── app/
│   └── layout.tsx
└── .env.local`}
        />
        <p className="mt-4">{t("fileStructureExample")}</p>
        <CodeBlock
          filename="messages/en/common.json"
          language="json"
          code={`{
  "homepage": {
    "title": "Welcome",
    "description": "Hello world"
  },
  "nav": {
    "home": "Home",
    "about": "About"
  }
}`}
        />
      </DocSection>

      <DocSection title={t("serverSetup")} id="server-setup">
        <p>{t("serverSetupDesc")}</p>
        <CodeBlock
          filename="app/layout.tsx"
          language="typescript"
          code={`import { loadMessages, LOCALE_COOKIE_NAME } from "@uu-webtools/client/server";
import { I18nProvider, NextErrorProvider } from "@uu-webtools/client";
import { cookies } from "next/headers";
import path from "path";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? "en";
  const messages = await loadMessages(
    locale,
    path.join(process.cwd(), "messages"),
  );

  return (
    <NextErrorProvider>
      <I18nProvider locale={locale} messages={messages}>
        <html lang={locale}>
          <body>{children}</body>
        </html>
      </I18nProvider>
    </NextErrorProvider>
  );
}`}
        />
      </DocSection>

      <DocSection title={t("useTranslationHook")} id="use-translation">
        <p>{t("useTranslationDesc")}</p>
        <CodeBlock
          filename="components/HomePage.tsx"
          language="typescript"
          code={`"use client";

import { useTranslation } from "@uu-webtools/client";

export function HomePage() {
  const { t } = useTranslation("homepage");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}`}
        />
        <p className="mt-4">{t("useTranslationPrefix")}</p>
        <CodeBlock
          language="typescript"
          code={`// With prefix — resolves "homepage.title"
const { t } = useTranslation("homepage");
t("title"); // → "Welcome"

// Without prefix — use full key path
const { t } = useTranslation();
t("homepage.title"); // → "Welcome"`}
        />
      </DocSection>

      <DocSection title={t("languageSwitching")} id="language-switching">
        <p>{t("languageSwitchingDesc")}</p>
        <CodeBlock
          filename="components/LanguageSwitcher.tsx"
          language="typescript"
          code={`"use client";

import { useTranslation } from "@uu-webtools/client";

export function LanguageSwitcher() {
  const { locale, changeLocale } = useTranslation();

  return (
    <select
      value={locale}
      onChange={(e) => changeLocale(e.target.value)}
    >
      <option value="en">English</option>
      <option value="cs">Čeština</option>
    </select>
  );
}`}
        />
        <p className="mt-4">{t("languageSwitchingHow")}</p>
      </DocSection>

      <DocSection title={t("missingTranslations")} id="missing-translations">
        <p>{t("missingTranslationsDesc")}</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>{t("missingItem1")}</li>
          <li>{t("missingItem2")}</li>
          <li>{t("missingItem3")}</li>
        </ul>
        <p className="mt-4">{t("missingTranslationsCustom")}</p>
        <CodeBlock
          language="typescript"
          code={`<I18nProvider
  locale={locale}
  messages={messages}
  onMissingTranslation={({ key, locale }) => {
    console.warn(\`Missing: \${key} [\${locale}]\`);
  }}
>`}
        />
      </DocSection>

      <DocSection title={t("syncWithCli")} id="sync-with-cli">
        <p>
          {t("syncWithCliDesc")}{" "}
          <Link href="/docs/cli" className="text-primary underline hover:text-primary/80">
            {t("syncWithCliLink")}
          </Link>
        </p>
        <CodeBlock
          language="bash"
          code={`# Pull translations from dashboard
npx @uu-webtools/cli pull

# Push local translations to dashboard
npx @uu-webtools/cli push`}
        />
      </DocSection>

      <DocSection title={t("automation")} id="automation">
        <p>{t("automationDesc")}</p>
        <CodeBlock
          filename="package.json"
          language="json"
          code={`{
  "scripts": {
    "predev": "npx @uu-webtools/cli pull",
    "prebuild": "npx @uu-webtools/cli pull",
    "dev": "next dev",
    "build": "next build"
  }
}`}
        />
        <p className="mt-4">{t("automationHow")}</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">predev</code> — {t("automationPredev")}
          </li>
          <li>
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">prebuild</code> — {t("automationPrebuild")}
          </li>
        </ul>
        <p className="mt-4">
          {t("automationMore")}{" "}
          <Link href="/docs/cli#automation" className="text-primary underline hover:text-primary/80">
            {t("automationMoreLink")}
          </Link>
        </p>
      </DocSection>

      <DocSection title={t("serverExports")} id="server-exports">
        <p>{t("serverExportsDesc")}</p>
        <CodeBlock
          language="typescript"
          code={`import {
  loadMessages,        // Load messages for a locale from messages/ dir
  loadAllMessages,     // Load messages for all locales
  getAvailableLocales, // List available locale folders
  LOCALE_COOKIE_NAME,  // Cookie name used for locale persistence
} from "@uu-webtools/client/server";`}
        />
      </DocSection>
    </div>
  );
}
