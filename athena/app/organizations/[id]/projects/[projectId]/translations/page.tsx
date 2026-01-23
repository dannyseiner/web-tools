"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { exportWithProjectLayout } from "@/modules/core/layouts/project-layout";
import { LanguageSetup } from "@/modules/translations/components/language-setup";
import { TranslationGrid } from "@/modules/translations/components/translation-grid";

function TranslationsPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;
  const [setupComplete, setSetupComplete] = useState(false);

  const settings = useQuery(api.projectSettings.getProjectSettings, {
    projectId,
  });

  if (settings === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings?.defaultLanguage && !setupComplete) {
    return (
      <LanguageSetup
        projectId={projectId}
        onComplete={() => setSetupComplete(true)}
      />
    );
  }

  const defaultLanguage = settings?.defaultLanguage || "en";
  const supportedLanguages = settings?.supportedLanguages || [defaultLanguage];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <TranslationGrid
        projectId={projectId}
        defaultLanguage={defaultLanguage}
        supportedLanguages={supportedLanguages}
      />
    </div>
  );
}

export default exportWithProjectLayout(TranslationsPage);
