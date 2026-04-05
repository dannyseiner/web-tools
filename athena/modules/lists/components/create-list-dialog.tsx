"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/modules/core/ui/dialog";
import { Button } from "@/modules/core/ui/button";
import { Input } from "@/modules/core/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/ui/select";
import { Checkbox } from "@/modules/core/ui/checkbox";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface FieldDef {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "boolean"
    | "date"
    | "select"
    | "url"
    | "richtext";
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

const FIELD_TYPE_KEYS = [
  "text",
  "number",
  "boolean",
  "date",
  "select",
  "url",
  "richtext",
] as const;

interface CreateListDialogProps {
  projectId: Id<"projects">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editList?: {
    _id: Id<"lists">;
    name: string;
    description?: string;
    icon?: string;
    fields: FieldDef[];
  };
}

export function CreateListDialog({
  projectId,
  open,
  onOpenChange,
  editList,
}: CreateListDialogProps) {
  const createList = useMutation(api.lists.create);
  const updateList = useMutation(api.lists.update);
  const t = useTranslations("components.lists");
  const tCommon = useTranslations("common");

  const [name, setName] = useState(editList?.name ?? "");
  const [description, setDescription] = useState(
    editList?.description ?? "",
  );
  const [fields, setFields] = useState<FieldDef[]>(
    editList?.fields ?? [
      { name: "title", label: "Title", type: "text", required: true },
    ],
  );
  const [optionsInput, setOptionsInput] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editList;

  const resetForm = () => {
    setName("");
    setDescription("");
    setFields([
      { name: "title", label: "Title", type: "text", required: true },
    ]);
    setOptionsInput({});
    setError("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        name: "",
        label: "",
        type: "text",
        required: false,
      },
    ]);
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
    setOptionsInput((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const updateField = (index: number, updates: Partial<FieldDef>) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f)),
    );
  };

  const handleAddOption = (fieldIndex: number) => {
    const value = optionsInput[fieldIndex]?.trim();
    if (!value) return;
    const field = fields[fieldIndex];
    const existing = field.options ?? [];
    if (existing.includes(value)) return;
    updateField(fieldIndex, { options: [...existing, value] });
    setOptionsInput((prev) => ({ ...prev, [fieldIndex]: "" }));
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = fields[fieldIndex];
    updateField(fieldIndex, {
      options: field.options?.filter((_, i) => i !== optionIndex),
    });
  };

  const handleSubmit = async () => {
    setError("");

    if (!name.trim()) {
      setError(t("createDialog.errors.nameRequired"));
      return;
    }

    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].label.trim()) {
        setError(t("createDialog.errors.fieldNeedsLabel", { number: i + 1 }));
        return;
      }
      if (fields[i].type === "select" && (!fields[i].options || fields[i].options!.length === 0)) {
        setError(t("createDialog.errors.fieldNeedsOption", { label: fields[i].label }));
        return;
      }
    }

    const processedFields = fields.map((f) => ({
      ...f,
      name: f.name || f.label.toLowerCase().replace(/\s+/g, "_"),
      options: f.type === "select" ? f.options : undefined,
      defaultValue: f.defaultValue || undefined,
    }));

    setIsLoading(true);
    try {
      if (isEditing) {
        await updateList({
          listId: editList._id,
          name: name.trim(),
          description: description.trim() || undefined,
          fields: processedFields,
        });
      } else {
        await createList({
          projectId,
          name: name.trim(),
          description: description.trim() || undefined,
          fields: processedFields,
        });
      }
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t("createDialog.errors.somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("createDialog.editTitle") : t("createDialog.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("createDialog.editDescription")
              : t("createDialog.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* List Info */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">
                {t("createDialog.name")}
              </label>
              <Input
                placeholder={t("createDialog.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                {t("createDialog.description")}{" "}
                <span className="text-muted-foreground font-normal">
                  {tCommon("optional")}
                </span>
              </label>
              <Input
                placeholder={t("createDialog.descriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                {t("createDialog.fields")}
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addField}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {t("createDialog.addField")}
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-background-dim p-3 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t("createDialog.fieldLabel")}
                        </label>
                        <Input
                          placeholder={t("createDialog.fieldLabelPlaceholder")}
                          value={field.label}
                          onChange={(e) =>
                            updateField(index, { label: e.target.value })
                          }
                          className="mt-1 h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {t("createDialog.fieldType")}
                        </label>
                        <Select
                          value={field.type}
                          onValueChange={(value) =>
                            updateField(index, {
                              type: value as FieldDef["type"],
                            })
                          }
                        >
                          <SelectTrigger className="mt-1 h-9 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPE_KEYS.map((key) => (
                              <SelectItem key={key} value={key}>
                                {t(`fieldTypes.${key}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-end gap-2 pt-5">
                      <div className="flex items-center gap-1.5">
                        <Checkbox
                          checked={field.required}
                          onCheckedChange={(checked) =>
                            updateField(index, { required: !!checked })
                          }
                        />
                        <label className="text-xs text-muted-foreground">
                          {t("createDialog.fieldRequired")}
                        </label>
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeField(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {field.type === "select" && (
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        {t("createDialog.fieldOptions")}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {field.options?.map((opt, optIdx) => (
                          <span
                            key={optIdx}
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                          >
                            {opt}
                            <button
                              type="button"
                              onClick={() => removeOption(index, optIdx)}
                              className="hover:text-destructive"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t("createDialog.addOptionPlaceholder")}
                          value={optionsInput[index] ?? ""}
                          onChange={(e) =>
                            setOptionsInput((prev) => ({
                              ...prev,
                              [index]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddOption(index);
                            }
                          }}
                          className="h-8 flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddOption(index)}
                          className="h-8"
                        >
                          {t("createDialog.addOption")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? t("createDialog.saveButton") : t("createDialog.createButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
