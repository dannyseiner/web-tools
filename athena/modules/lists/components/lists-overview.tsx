"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/modules/core/ui/button";
import {
  Plus,
  List,
  Loader2,
  FileText,
  Hash,
  ToggleLeft,
  Calendar,
  ChevronDown,
  Link2,
  Type,
} from "lucide-react";
import { CreateListDialog } from "./create-list-dialog";
import { ListDetail } from "./list-detail";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

interface ListsOverviewProps {
  projectId: Id<"projects">;
}

const fieldTypeIcons: Record<string, React.ElementType> = {
  text: Type,
  number: Hash,
  boolean: ToggleLeft,
  date: Calendar,
  select: ChevronDown,
  url: Link2,
  richtext: FileText,
};

export function ListsOverview({ projectId }: ListsOverviewProps) {
  const lists = useQuery(api.lists.getByProject, { projectId });
  const t = useTranslations("components.lists");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [editingList, setEditingList] = useState<any>(null);

  const isLoading = lists === undefined;

  const handleEditFromDetail = () => {
    setEditingList(selectedList);
    setCreateDialogOpen(true);
  };

  const currentList = selectedList
    ? lists?.find((l: any) => l._id === selectedList._id) ?? selectedList
    : null;

  if (currentList) {
    return (
      <ListDetail
        list={currentList}
        onBack={() => setSelectedList(null)}
        onEdit={handleEditFromDetail}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("subtitle")}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingList(null);
            setCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {t("newList")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : lists && lists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {lists.map((list: any, index: number) => (
              <motion.div
                key={list._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <button
                  onClick={() => setSelectedList(list)}
                  className="w-full text-left rounded-lg border border-border bg-white p-5 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <List className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-foreground truncate">
                        {list.name}
                      </h3>
                      {list.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {list.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {list.fields.slice(0, 4).map((field: any) => {
                      const Icon = fieldTypeIcons[field.type] || Type;
                      return (
                        <span
                          key={field.name}
                          className="inline-flex items-center gap-1 rounded-md bg-background-dim px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          <Icon className="h-3 w-3" />
                          {field.label}
                        </span>
                      );
                    })}
                    {list.fields.length > 4 && (
                      <span className="inline-flex items-center rounded-md bg-background-dim px-2 py-0.5 text-[11px] text-muted-foreground">
                        {t("moreFields", { count: list.fields.length - 4 })}
                      </span>
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <List className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            {t("empty.title")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            {t("empty.description")}
          </p>
          <Button
            className="mt-5"
            onClick={() => {
              setEditingList(null);
              setCreateDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {t("empty.createFirst")}
          </Button>
        </div>
      )}

      <CreateListDialog
        projectId={projectId}
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingList(null);
        }}
        editList={editingList}
      />
    </div>
  );
}
