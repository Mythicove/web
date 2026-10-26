"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CopyIcon, Loader2Icon, TicketIcon } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InvitesPanel({ token }: { token: string | null }) {
  const t = useTranslations("admin");
  const tc = useTranslations("common");
  const errText = useErrorText();
  const [count, setCount] = useState(5);
  const [codes, setCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (busy || token === null) return;
    setBusy(true);
    try {
      const r = await apiClient.admin.inviteCodes(token, count);
      setCodes(r.codes);
      toast.success(t("generated"));
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(false);
    }
  };

  if (token === null) return <p className="text-text-muted text-sm">{t("needToken")}</p>;

  return (
    <div className="max-w-xl space-y-3">
      <div className="flex items-end gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="invite-count">{t("inviteCount")}</Label>
          <Input
            id="invite-count"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </div>
        <Button onClick={() => void generate()} disabled={busy}>
          {busy ? <Loader2Icon className="animate-spin" /> : <TicketIcon />}
          {t("generate")}
        </Button>
      </div>
      {codes.length > 0 && (
        <div className="border-border bg-surface rounded-lg border p-4">
          {codes.map((c) => (
            <div key={c} className="flex items-center justify-between gap-2 py-0.5">
              <code className="text-highlight text-sm">{c}</code>
              <Button
                size="icon-xs"
                variant="ghost"
                aria-label={tc("copy")}
                onClick={() => void navigator.clipboard.writeText(c)}
              >
                <CopyIcon />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
