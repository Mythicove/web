"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2Icon, MegaphoneIcon } from "lucide-react";
import { apiClient, type Announcement } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

export function AnnouncementPanel({ token }: { token: string | null }) {
  const t = useTranslations("admin");
  const errText = useErrorText();
  const [a, setA] = useState<Announcement>({ title: "", body: "", enabled: false });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token === null) return;
    apiClient.admin
      .announcement(token)
      .then(setA)
      .catch(() => {});
  }, [token]);

  const save = async () => {
    if (busy || token === null) return;
    setBusy(true);
    try {
      await apiClient.admin.setAnnouncement(token, a);
      toast.success(t("saved"));
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(false);
    }
  };

  if (token === null) return <p className="text-text-muted text-sm">{t("needToken")}</p>;

  return (
    <Card className="bg-surface shadow-card max-w-xl">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <MegaphoneIcon className="text-text-muted size-4" />
          <h2 className="font-display text-sm font-semibold">{t("tab.announcement")}</h2>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="ann-title">{t("annTitle")}</Label>
          <Input
            id="ann-title"
            value={a.title}
            onChange={(e) => setA({ ...a, title: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="ann-body">{t("annBody")}</Label>
          <Input
            id="ann-body"
            value={a.body}
            onChange={(e) => setA({ ...a, body: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={a.enabled}
            onCheckedChange={(v) => setA({ ...a, enabled: v === true })}
          />
          {t("enabled")}
        </label>
        <Button onClick={() => void save()} disabled={busy}>
          {busy && <Loader2Icon className="animate-spin" />}
          {t("save")}
        </Button>
      </CardContent>
    </Card>
  );
}
