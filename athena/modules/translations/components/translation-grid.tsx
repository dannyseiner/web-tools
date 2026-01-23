"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TranslationRow } from "./translation-row";
import { SearchBar } from "./search-bar";
import { AddTranslationModal } from "./add-translation-modal";
import { AddLanguageModal } from "./add-language-modal";
import { UploadTranslationsModal } from "./upload-translations-modal";
import { ActionsDropdown } from "./actions-dropdown";
import { LanguageFilter } from "./language-filter";
import { searchTranslations, groupByNamespace } from "../utils/search";
import {
  Languages,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface TranslationGridProps {
  projectId: Id<"projects">;
  defaultLanguage: string;
  supportedLanguages: string[];
}

const ITEMS_PER_PAGE = 40;

export function TranslationGrid({
  projectId,
  defaultLanguage,
  supportedLanguages,
}: TranslationGridProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTranslationId, setEditingTranslationId] =
    useState<Id<"translations"> | null>(null);
  const [selectedNamespace, setSelectedNamespace] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddLanguageModalOpen, setIsAddLanguageModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [currentPage, setCurrentPage] = useState(1);

  const translations = useQuery(api.translations.getProjectTranslations, {
    projectId,
    languageCode: selectedLanguage,
  });

  const allLanguages = useQuery(api.languages.getActiveLanguages);

  const activeEditors = useQuery(api.translationEditors.getActiveEditors, {
    projectId,
    languageCode: selectedLanguage,
  });

  const defaultTranslations = useQuery(
    api.translations.getProjectTranslations,
    selectedLanguage !== defaultLanguage
      ? { projectId, languageCode: defaultLanguage }
      : "skip",
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (editingTranslationId) {
        // Keep heartbeat alive
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [editingTranslationId]);

  useEffect(() => {
    setTimeout(() => {
      setCurrentPage(1);
    }, 0);
  }, [searchQuery, selectedNamespace, selectedLanguage]);

  if (translations === undefined || allLanguages === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  let allTranslations = [...translations];

  if (selectedLanguage !== defaultLanguage && defaultTranslations) {
    const currentKeys = new Set(translations.map((t) => t.key));
    const missingFromDefault = defaultTranslations.filter(
      (dt) => !currentKeys.has(dt.key),
    );

    allTranslations = [
      ...allTranslations,
      ...missingFromDefault.map((dt) => ({
        ...dt,
        _id: dt._id as Id<"translations">,
        languageCode: selectedLanguage,
        value: "",
      })),
    ];
  }

  const filteredTranslations = searchTranslations(allTranslations, searchQuery);
  const grouped = groupByNamespace(filteredTranslations);
  const namespaces = Object.keys(grouped).sort();

  const displayTranslations =
    selectedNamespace === "all"
      ? filteredTranslations
      : grouped[selectedNamespace] || [];

  const emptyTranslations = displayTranslations.filter((t) => !t.value).length;

  const totalPages = Math.ceil(displayTranslations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTranslations = displayTranslations.slice(startIndex, endIndex);

  const editorMap = new Map(
    activeEditors?.map((e) => [
      e.translationId,
      { userName: e.userName, userEmail: e.userEmail },
    ]) || [],
  );

  const supportedLanguageObjects = allLanguages.filter((lang) =>
    supportedLanguages.includes(lang.code),
  );

  return (
    <div className="space-y-6">
      <AddTranslationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projectId={projectId}
        languageCode={selectedLanguage}
      />

      <AddLanguageModal
        isOpen={isAddLanguageModalOpen}
        onClose={() => setIsAddLanguageModalOpen(false)}
        projectId={projectId}
        existingLanguages={supportedLanguages}
      />

      <UploadTranslationsModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        projectId={projectId}
        languageCode={selectedLanguage}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Languages className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {t("components.translations.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {allTranslations.length}{" "}
              {t("components.translations.translationsIn")}{" "}
              {selectedLanguage.toUpperCase()}
              {emptyTranslations > 0 && (
                <span className="text-amber-600 dark:text-amber-500">
                  {" "}
                  ({emptyTranslations} {t("components.translations.empty")})
                </span>
              )}
            </p>
          </div>
        </div>
        <ActionsDropdown
          onAddTranslation={() => setIsAddModalOpen(true)}
          onAddLanguage={() => setIsAddLanguageModalOpen(true)}
          onUploadJson={() => setIsUploadModalOpen(true)}
        />
      </div>

      {emptyTranslations > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-amber-600 dark:text-amber-500">
              {t("components.translations.emptyTranslations")}
            </p>
            <p className="text-sm text-amber-600/80 dark:text-amber-500/80">
              {emptyTranslations}{" "}
              {emptyTranslations !== 1
                ? t("components.translations.translationsAre")
                : t("components.translations.translationIs")}{" "}
              {t("components.translations.emptyIn")}{" "}
              {selectedLanguage.toUpperCase()}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t("components.translations.searchPlaceholder")}
          />
        </div>
        <LanguageFilter
          languages={supportedLanguageObjects}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        <select
          value={selectedNamespace}
          onChange={(e) => setSelectedNamespace(e.target.value)}
          className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
        >
          <option value="all">
            {t("components.translations.allNamespaces")}
          </option>
          {namespaces.map((ns) => (
            <option key={ns} value={ns}>
              {ns} ({grouped[ns].length})
            </option>
          ))}
        </select>
      </div>

      {displayTranslations.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Languages className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchQuery
              ? t("components.translations.noTranslationsFound")
              : t("components.translations.noTranslationsYet")}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? t("components.translations.tryAdjustingSearch")
              : t("components.translations.startByAdding")}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedTranslations.map((translation) => (
              <TranslationRow
                key={`${translation.key}-${translation.languageCode}`}
                translation={{
                  ...translation,
                  projectId,
                  languageCode: selectedLanguage,
                }}
                isEditing={editorMap.has(translation._id)}
                editorInfo={editorMap.get(translation._id)}
                onStartEdit={() => setEditingTranslationId(translation._id)}
                onStopEdit={() => setEditingTranslationId(null)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                {t("components.translations.showing")} {startIndex + 1} -{" "}
                {Math.min(endIndex, displayTranslations.length)}{" "}
                {t("components.translations.of")} {displayTranslations.length}{" "}
                {t("components.translations.translationsIn").toLowerCase()}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-foreground px-3">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-accent rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
