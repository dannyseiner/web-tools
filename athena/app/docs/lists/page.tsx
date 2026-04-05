"use client";

import { DocSection } from "@/modules/docs/components/doc-section";
import { CodeBlock } from "@/modules/docs/components/code-block";
import { PUBLIC_API_ROUTES } from "@/modules/api/constants";
import { useTranslations } from "next-intl";

export default function ListsDocsPage() {
  const t = useTranslations("modules.docs.lists");

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
        </ul>
        <p className="mt-4">
          {t("authNote")}{" "}
          <code className="bg-muted px-2 py-1 rounded">X-Project-Token</code>
        </p>
      </DocSection>

      <DocSection title={t("getAllLists")} id="get-all-lists">
        <p>{t("getAllListsDesc")}</p>
        <p className="text-sm text-muted-foreground mt-2 mb-2">
          <code className="bg-muted px-2 py-1 rounded">
            GET {PUBLIC_API_ROUTES.lists.getAll}
          </code>
        </p>
        <CodeBlock
          language="typescript"
          code={`const response = await fetch('${PUBLIC_API_ROUTES.lists.getAll}', {
  headers: {
    'X-Project-Token': 'your_project_token_here'
  }
});

const lists = await response.json();`}
        />
        <p className="mt-4 font-medium text-foreground">{t("exampleResponse")}</p>
        <CodeBlock
          language="json"
          code={`[
  {
    "_id": "k57...",
    "name": "Team Members",
    "slug": "team-members",
    "description": "All team members and their roles",
    "icon": null,
    "fields": [
      {
        "name": "name",
        "label": "Name",
        "type": "text",
        "required": true
      },
      {
        "name": "role",
        "label": "Role",
        "type": "select",
        "required": true,
        "options": ["Developer", "Designer", "Manager"]
      },
      {
        "name": "email",
        "label": "Email",
        "type": "url",
        "required": false
      }
    ],
    "_creationTime": 1712345678901
  }
]`}
        />
      </DocSection>

      <DocSection title={t("getBySlug")} id="get-by-slug">
        <p>{t("getBySlugDesc")}</p>
        <p className="text-sm text-muted-foreground mt-2 mb-2">
          <code className="bg-muted px-2 py-1 rounded">
            GET {PUBLIC_API_ROUTES.lists.getBySlug}
          </code>
        </p>
        <CodeBlock
          language="typescript"
          code={`const response = await fetch('${PUBLIC_API_ROUTES.lists.getAll}/team-members', {
  headers: {
    'X-Project-Token': 'your_project_token_here'
  }
});

const list = await response.json();`}
        />
        <p className="mt-4 font-medium text-foreground">{t("exampleResponse")}</p>
        <CodeBlock
          language="json"
          code={`{
  "_id": "k57...",
  "name": "Team Members",
  "slug": "team-members",
  "description": "All team members and their roles",
  "fields": [ ... ],
  "items": [
    {
      "_id": "j83...",
      "listId": "k57...",
      "projectId": "p12...",
      "values": {
        "name": "Jan Novák",
        "role": "Developer",
        "email": "jan@example.com"
      },
      "order": 0,
      "createdBy": "u45...",
      "_creationTime": 1712345678901
    }
  ]
}`}
        />
        <p className="mt-4 text-sm text-muted-foreground">{t("notFoundNote")}</p>
        <CodeBlock
          language="json"
          code={`{ "error": "List not found" }  // 404`}
        />
      </DocSection>

      <DocSection title={t("responseTypes")} id="response-types">
        <p>{t("responseTypesDesc")}</p>

        <p className="mt-4 font-medium text-foreground">{t("typeList")}</p>
        <CodeBlock
          language="typescript"
          code={`interface List {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  fields: Field[];
  _creationTime: number;
}`}
        />

        <p className="mt-4 font-medium text-foreground">{t("typeField")}</p>
        <CodeBlock
          language="typescript"
          code={`interface Field {
  name: string;       // Identifikátor pole (klíč ve values)
  label: string;      // Zobrazovaný název
  type: "text" | "number" | "boolean" | "date" | "select" | "url" | "richtext";
  required: boolean;
  options?: string[]; // Pouze pro type "select"
  defaultValue?: string;
}`}
        />

        <p className="mt-4 font-medium text-foreground">{t("typeListItem")}</p>
        <CodeBlock
          language="typescript"
          code={`interface ListItem {
  _id: string;
  listId: string;
  projectId: string;
  values: Record<string, any>;  // Klíče odpovídají field.name
  order: number;
  createdBy: string;
  _creationTime: number;
}`}
        />
      </DocSection>
    </div>
  );
}
