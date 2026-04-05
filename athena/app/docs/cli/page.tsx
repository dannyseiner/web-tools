"use client";

import { DocSection } from "@/modules/docs/components/doc-section";
import { CodeBlock } from "@/modules/docs/components/code-block";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function CliPage() {
  const t = useTranslations("modules.docs.cli");

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
        <p className="mt-4">
          {t("overviewI18nLink")}{" "}
          <Link href="/docs/i18n" className="text-primary underline hover:text-primary/80">
            {t("overviewI18nLinkText")}
          </Link>
        </p>
      </DocSection>

      <DocSection title={t("installation")} id="installation">
        <p>{t("installationDesc")}</p>
        <CodeBlock language="bash" code={`npm install -g @uu-webtools/cli`} />
        <p className="mt-4">{t("installationNpx")}</p>
        <CodeBlock language="bash" code={`npx @uu-webtools/cli <command>`} />
      </DocSection>

      <DocSection title={t("init")} id="init">
        <p>{t("initDesc")}</p>
        <CodeBlock language="bash" code={`npx @uu-webtools/cli init`} />
        <p className="mt-4">{t("initWhat")}</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>{t("initItem1")}</li>
          <li>{t("initItem2")}</li>
          <li>{t("initItem3")}</li>
        </ul>
      </DocSection>

      <DocSection title={t("pull")} id="pull">
        <p>{t("pullDesc")}</p>
        <CodeBlock language="bash" code={`npx @uu-webtools/cli pull`} />
        <p className="mt-4">{t("pullHow")}</p>
        <CodeBlock
          language="text"
          code={`messages/
├── en/
│   └── common.json
└── cs/
    └── common.json`}
        />
      </DocSection>

      <DocSection title={t("push")} id="push">
        <p>{t("pushDesc")}</p>
        <CodeBlock language="bash" code={`npx @uu-webtools/cli push`} />
        <p className="mt-4">{t("pushHow")}</p>
      </DocSection>

      <DocSection title={t("status")} id="status">
        <p>{t("statusDesc")}</p>
        <CodeBlock language="bash" code={`npx @uu-webtools/cli status`} />
        <p className="mt-4">{t("statusHow")}</p>
      </DocSection>

      <DocSection title={t("environment")} id="environment">
        <p>{t("environmentDesc")}</p>
        <CodeBlock
          filename=".env.local"
          language="bash"
          code={`NEXT_PUBLIC_WEBTOOLS_PROJECT_TOKEN=your_project_token_here`}
        />
        <p className="mt-4">{t("environmentLookup")}</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">.env.local</code> {t("environmentFirst")}
          </li>
          <li>
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">.env</code> {t("environmentSecond")}
          </li>
        </ul>
        <p className="mt-4">
          {t("environmentTokenLink")}{" "}
          <Link href="/docs/authentication" className="text-primary underline hover:text-primary/80">
            {t("environmentTokenLinkText")}
          </Link>
        </p>
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
        <p className="mt-4">{t("automationTip")}</p>
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
├── .env.local
└── package.json`}
        />
        <p className="mt-4">
          {t("fileStructureI18nLink")}{" "}
          <Link href="/docs/i18n#file-structure" className="text-primary underline hover:text-primary/80">
            {t("fileStructureI18nLinkText")}
          </Link>
        </p>
      </DocSection>
    </div>
  );
}
