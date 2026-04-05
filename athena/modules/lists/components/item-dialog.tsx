"use client";

import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface FieldDef {
  name: string;
  label: string;
  type: "text" | "number" | "boolean" | "date" | "select" | "url" | "richtext";
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

interface ItemDialogProps {
  listId: Id<"lists">;
  fields: FieldDef[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: {
    _id: Id<"listItems">;
    values: Record<string, any>;
  };
}

export function ItemDialog({
  listId,
  fields,
  open,
  onOpenChange,
  editItem,
}: ItemDialogProps) {
  const createItem = useMutation(api.lists.createItem);
  const updateItem = useMutation(api.lists.updateItem);
  const t = useTranslations("components.lists.itemDialog");
  const tCommon = useTranslations("common");

  const getInitialValues = () => {
    const values: Record<string, any> = {};
    for (const field of fields) {
      if (editItem) {
        values[field.name] = editItem.values[field.name] ?? (field.type === "boolean" ? false : "");
      } else {
        values[field.name] = field.defaultValue ?? (field.type === "boolean" ? false : "");
      }
    }
    return values;
  };

  const [values, setValues] = useState<Record<string, any>>(getInitialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!editItem;

  useEffect(() => {
    if (open) {
      setValues(getInitialValues());
      setError("");
    }
  }, [open, editItem]);

  const setValue = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");

    for (const field of fields) {
      if (field.required) {
        const val = values[field.name];
        if (val === undefined || val === null || val === "") {
          setError(t("errors.fieldRequired", { label: field.label }));
          return;
        }
      }
    }

    const processed: Record<string, any> = {};
    for (const field of fields) {
      const raw = values[field.name];
      if (field.type === "number" && raw !== "" && raw !== undefined) {
        processed[field.name] = Number(raw);
      } else if (field.type === "boolean") {
        processed[field.name] = !!raw;
      } else {
        processed[field.name] = raw ?? "";
      }
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        await updateItem({ itemId: editItem._id, values: processed });
      } else {
        await createItem({ listId, values: processed });
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t("errors.somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: FieldDef) => {
    const value = values[field.name];

    switch (field.type) {
      case "boolean":
        return (
          <div className="flex items-center gap-2 h-12">
            <Checkbox
              checked={!!value}
              onCheckedChange={(checked) => setValue(field.name, !!checked)}
            />
            <span className="text-sm text-muted-foreground">
              {value ? t("booleanYes") : t("booleanNo")}
            </span>
          </div>
        );
      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={(v) => setValue(field.name, v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectPlaceholder", { label: field.label.toLowerCase() })} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "number":
        return (
          <Input
            type="number"
            placeholder={t("enterPlaceholder", { label: field.label.toLowerCase() })}
            value={value ?? ""}
            onChange={(e) => setValue(field.name, e.target.value)}
          />
        );
      case "date":
        return (
          <Input
            type="date"
            value={value ?? ""}
            onChange={(e) => setValue(field.name, e.target.value)}
          />
        );
      case "url":
        return (
          <Input
            type="url"
            placeholder={t("urlPlaceholder")}
            value={value ?? ""}
            onChange={(e) => setValue(field.name, e.target.value)}
          />
        );
      case "richtext":
        return (
          <textarea
            placeholder={t("enterPlaceholder", { label: field.label.toLowerCase() })}
            value={value ?? ""}
            onChange={(e) => setValue(field.name, e.target.value)}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-none"
          />
        );
      default:
        return (
          <Input
            placeholder={t("enterPlaceholder", { label: field.label.toLowerCase() })}
            value={value ?? ""}
            onChange={(e) => setValue(field.name, e.target.value)}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t("editTitle") : t("addTitle")}</DialogTitle>
          <DialogDescription>
            {isEditing ? t("editDescription") : t("addDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="text-sm font-medium text-foreground">
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-0.5">*</span>
                )}
              </label>
              <div className="mt-1.5">{renderField(field)}</div>
            </div>
          ))}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? t("saveButton") : t("addButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
