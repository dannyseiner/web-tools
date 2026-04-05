"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/modules/core/ui/button";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { ItemDialog } from "./item-dialog";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

interface FieldDef {
  name: string;
  label: string;
  type: "text" | "number" | "boolean" | "date" | "select" | "url" | "richtext";
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

interface ListDetailProps {
  list: {
    _id: Id<"lists">;
    name: string;
    description?: string;
    icon?: string;
    fields: FieldDef[];
  };
  onBack: () => void;
  onEdit: () => void;
}

export function ListDetail({ list, onBack, onEdit }: ListDetailProps) {
  const items = useQuery(api.lists.getItems, { listId: list._id });
  const removeItem = useMutation(api.lists.removeItem);
  const removeList = useMutation(api.lists.remove);
  const t = useTranslations("components.lists.detail");
  const tCommon = useTranslations("common");

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingItemId, setDeletingItemId] = useState<Id<"listItems"> | null>(
    null,
  );
  const [showDeleteList, setShowDeleteList] = useState(false);

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setItemDialogOpen(true);
  };

  const handleDeleteItem = async (itemId: Id<"listItems">) => {
    try {
      await removeItem({ itemId });
    } catch (err) {
      console.error("Failed to delete item", err);
    }
    setDeletingItemId(null);
  };

  const handleDeleteList = async () => {
    try {
      await removeList({ listId: list._id });
      onBack();
    } catch (err) {
      console.error("Failed to delete list", err);
    }
  };

  const renderCellValue = (field: FieldDef, value: any) => {
    if (value === undefined || value === null || value === "") {
      return <span className="text-muted-foreground">--</span>;
    }

    switch (field.type) {
      case "boolean":
        return value ? (
          <span className="inline-flex items-center gap-1 text-primary">
            <Check className="h-3.5 w-3.5" /> {t("booleanYes")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <X className="h-3.5 w-3.5" /> {t("booleanNo")}
          </span>
        );
      case "url":
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
          >
            {value.replace(/^https?:\/\//, "").slice(0, 30)}
            {value.replace(/^https?:\/\//, "").length > 30 && "..."}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      case "select":
        return (
          <span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {value}
          </span>
        );
      case "richtext":
        return (
          <span className="line-clamp-2 text-sm">{value}</span>
        );
      default:
        return <span className="text-sm">{String(value)}</span>;
    }
  };

  const isLoading = items === undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            className="mt-0.5 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {list.name}
            </h2>
            {list.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {list.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            {t("edit")}
          </Button>
          {!showDeleteList ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteList(true)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {t("delete")}
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteList}
              >
                {t("confirm")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteList(false)}
              >
                {tCommon("cancel")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-dim">
          <p className="text-sm font-medium text-muted-foreground">
            {isLoading
              ? tCommon("loading")
              : t("itemCount", { count: items?.length ?? 0 })}
          </p>
          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setItemDialogOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {t("addItem")}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : items && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background-dim/50">
                  {list.fields.map((field) => (
                    <th
                      key={field.name}
                      className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {field.label}
                    </th>
                  ))}
                  <th className="w-20 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {items.map((item: any) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border last:border-0 hover:bg-background-dim/30 transition-colors"
                    >
                      {list.fields.map((field) => (
                        <td key={field.name} className="px-4 py-3">
                          {renderCellValue(field, item.values?.[field.name])}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {deletingItemId === item._id ? (
                            <>
                              <Button
                                variant="destructive"
                                size="icon-sm"
                                onClick={() => handleDeleteItem(item._id)}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => setDeletingItemId(null)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleEditItem(item)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setDeletingItemId(item._id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {t("noItems.title")}
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              {t("noItems.description")}
            </p>
            <Button
              size="sm"
              onClick={() => {
                setEditingItem(null);
                setItemDialogOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {t("addItem")}
            </Button>
          </div>
        )}
      </div>

      <ItemDialog
        listId={list._id}
        fields={list.fields}
        open={itemDialogOpen}
        onOpenChange={(open) => {
          setItemDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        editItem={editingItem}
      />
    </div>
  );
}
