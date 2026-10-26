"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useTranslations } from "next-intl";
import { TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
}

// 破坏性操作的统一确认入口：不允许 window.confirm（不可本地化、不可样式化）。
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive = true,
  busy = false,
  onConfirm,
}: ConfirmDialogProps) {
  const t = useTranslations("common");
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 bg-black/50" />
        <AlertDialog.Popup className="border-border bg-surface shadow-pop fixed top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border p-6">
          <AlertDialog.Title className="font-display flex items-center gap-2 text-lg font-semibold">
            <TriangleAlertIcon
              className={destructive ? "text-danger size-5" : "text-warning size-5"}
            />
            {title ?? t("confirmTitle")}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-text-muted mt-2 text-sm">
            {description ?? t("confirmHint")}
          </AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Close render={<Button variant="outline" />} disabled={busy}>
              {t("cancel")}
            </AlertDialog.Close>
            <Button
              variant={destructive ? "destructive" : "default"}
              disabled={busy}
              onClick={() => {
                onOpenChange(false);
                onConfirm();
              }}
            >
              {confirmLabel ?? t("confirm")}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
