"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { KeyRoundIcon } from "lucide-react";
import { apiClient, type LoginMethod } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { PageSkeleton } from "@/components/skeleton";

export function LoginMethodsPanel({ token }: { token: string | null }) {
  const t = useTranslations("admin");
  const errText = useErrorText();
  const [methods, setMethods] = useState<LoginMethod[] | null>(null);

  const load = useCallback(() => {
    if (token === null) return;
    apiClient.admin
      .loginMethods(token)
      .then((r) => setMethods(r.methods))
      .catch((e) => {
        toast.error(errText(e));
        setMethods([]);
      });
  }, [token, errText]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (id: string) => {
    if (!methods || token === null) return;
    const next = methods.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
    setMethods(next);
    try {
      await apiClient.admin.updateLoginMethods(token, next);
      toast.success(t("saved"));
    } catch (e) {
      toast.error(errText(e));
      load();
    }
  };

  if (token === null) return <p className="text-text-muted text-sm">{t("needToken")}</p>;
  if (methods === null) return <PageSkeleton />;
  if (methods.length === 0) return <EmptyState icon={KeyRoundIcon} title={t("methodsEmpty")} />;

  return (
    <div className="space-y-2">
      {methods.map((m) => (
        <div
          key={m.id}
          className="border-border bg-surface flex items-center justify-between rounded-lg border px-4 py-3"
        >
          <span className="font-medium">{m.label}</span>
          <Button variant={m.enabled ? "default" : "outline"} onClick={() => void toggle(m.id)}>
            {m.enabled ? t("enabled") : t("disabled")}
          </Button>
        </div>
      ))}
    </div>
  );
}
