"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PackageIcon, Trash2Icon } from "lucide-react";
import { hoardClient, type HoardProject } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { PageSkeleton } from "@/components/skeleton";

export function ModsPanel({
  token,
  onToken,
  sessionAdmin = false,
}: {
  token: string | null;
  onToken: (v: string) => void;
  // hoard 侧已有登录态且 role=admin：用会话 cookie 即可，不必手贴令牌
  sessionAdmin?: boolean;
}) {
  const t = useTranslations("admin");
  const errText = useErrorText();
  const [mods, setMods] = useState<HoardProject[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const load = useCallback(() => {
    if (token === null) return;
    hoardClient
      .search("", 0, 100)
      .then((r) => setMods(r.hits))
      .catch((e) => {
        toast.error(errText(e));
        setMods([]);
      });
  }, [token, errText]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: NonNullable<HoardProject["status"]>) => {
    if (token === null) return;
    try {
      await hoardClient.setStatus(id, status, token);
      setMods((prev) => prev?.map((m) => (m.id === id ? { ...m, status } : m)) ?? null);
      toast.success(t("saved"));
    } catch (e) {
      toast.error(errText(e));
      load();
    }
  };

  const del = async () => {
    if (!pendingDelete || token === null) return;
    try {
      await hoardClient.deleteMod(pendingDelete, token);
      setMods((prev) => prev?.filter((m) => m.id !== pendingDelete) ?? null);
      toast.success(t("deleted"));
    } catch (e) {
      toast.error(errText(e));
    }
  };

  return (
    <div className="space-y-4">
      {sessionAdmin ? (
        <p className="text-success text-sm">{t("hoardUseSession")}</p>
      ) : (
        <div className="flex max-w-xs flex-col gap-1.5">
          <Label htmlFor="hoard-token">{t("hoardToken")}</Label>
          <Input
            id="hoard-token"
            value={token ?? ""}
            onChange={(e) => onToken(e.target.value)}
            type="password"
            autoComplete="off"
          />
          <p className="text-text-muted text-xs">{t("hoardTokenHint")}</p>
        </div>
      )}
      {token === null && <p className="text-text-muted text-sm">{t("needToken")}</p>}
      {token !== null && mods === null && <PageSkeleton />}
      {token !== null && mods !== null && mods.length === 0 && (
        <EmptyState icon={PackageIcon} title={t("noMods")} />
      )}
      <div className="space-y-2">
        {(mods ?? []).map((m) => (
          <div
            key={m.id}
            className="border-border bg-surface flex items-center justify-between rounded-lg border px-4 py-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{m.title}</span>
                <Badge variant="secondary">{m.status ?? "listed"}</Badge>
              </div>
              <div className="text-text-muted text-xs">{m.project_type}</div>
            </div>
            <div className="flex gap-2">
              <Select
                value={m.status ?? "listed"}
                onValueChange={(v) => setStatus(m.id, v as NonNullable<HoardProject["status"]>)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="listed">listed</SelectItem>
                  <SelectItem value="under_review">under_review</SelectItem>
                  <SelectItem value="rejected">rejected</SelectItem>
                  <SelectItem value="archived">archived</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setPendingDelete(m.id)}>
                <Trash2Icon />
                {t("delete")}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={t("delete")}
        onConfirm={() => void del()}
      />
    </div>
  );
}
