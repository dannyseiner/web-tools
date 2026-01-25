"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/core/ui/dialog";
import { Input } from "@/modules/core/ui/input";
import { Mail, X, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

interface InviteModalProps {
  organizationId: Id<"organizations">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteModal({
  organizationId,
  open,
  onOpenChange,
}: InviteModalProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  const sendInvites = useMutation(api.invitations.sendInvites);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddEmail = () => {
    const trimmedEmail = currentEmail.trim();
    if (!trimmedEmail) {
      setError(t("components.inviteModal.errors.emailEmpty"));
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError(t("components.inviteModal.errors.emailInvalid"));
      return;
    }
    if (emails.includes(trimmedEmail)) {
      setError(t("components.inviteModal.errors.emailAlreadyAdded"));
      return;
    }
    setEmails([...emails, trimmedEmail]);
    setCurrentEmail("");
    setError("");
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(emails.filter((e) => e !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSendInvites = async () => {
    if (emails.length === 0) {
      setError(t("components.inviteModal.errors.atLeastOneEmail"));
      return;
    }

    setIsLoading(true);
    try {
      await sendInvites({ organizationId, emails });
      setEmails([]);
      setCurrentEmail("");
      setError("");
      onOpenChange(false);
    } catch (err) {
      setError(t("components.inviteModal.errors.failedToSend"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("components.inviteModal.title")}</DialogTitle>
          <DialogDescription>
            {t("components.inviteModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder={t("components.inviteModal.emailPlaceholder")}
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              error={error}
              icon={{ name: Mail, position: "left" }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddEmail}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {t("components.inviteModal.addEmail")}
            </motion.button>
          </div>

          {emails.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("components.inviteModal.emailsToInvite")}</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-muted rounded-md px-3 py-2"
                  >
                    <span className="text-sm">{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
          >
            {t("components.inviteModal.cancel")}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSendInvites}
            disabled={isLoading || emails.length === 0}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("components.inviteModal.sendInvites")}
          </motion.button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
