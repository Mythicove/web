"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { KeyRoundIcon } from "lucide-react";
import { apiClient, type AuthPolicy, type AuthPolicyView, type LoginMethod } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { PageSkeleton } from "@/components/skeleton";

export function LoginMethodsPanel({ token }: { token: string | null }) {
  const t = useTranslations("admin");
  const errText = useErrorText();
  const [methods, setMethods] = useState<LoginMethod[] | null>(null);
  const [policy, setPolicy] = useState<AuthPolicyView | null>(null);

  const load = useCallback(() => {
    if (token === null) return;
    apiClient.admin
      .loginMethods(token)
      .then((r) => setMethods(r.methods))
      .catch((e) => {
        toast.error(errText(e));
        setMethods([]);
      });
    apiClient.admin
      .authPolicy(token)
      .then(setPolicy)
      .catch((e) => {
        toast.error(errText(e));
        setPolicy(null);
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
      // 关掉主密码会改变"纯密码账号"的含义，顺带把计数刷新
      load();
    } catch (e) {
      toast.error(errText(e));
      load();
    }
  };

  const savePolicy = async (next: AuthPolicy) => {
    if (token === null) return;
    try {
      await apiClient.admin.updateAuthPolicy(token, next);
      toast.success(t("saved"));
    } catch (e) {
      toast.error(errText(e));
    } finally {
      load();
    }
  };

  if (token === null) return <p className="text-text-muted text-sm">{t("needToken")}</p>;
  if (methods === null) return <PageSkeleton />;
  if (methods.length === 0) return <EmptyState icon={KeyRoundIcon} title={t("methodsEmpty")} />;

  const passwordEnabled = methods.some((m) => m.id === "password" && m.enabled);

  return (
    <div className="space-y-2">
      {methods.map((m) => (
        <div
          key={m.id}
          className="border-border bg-surface flex items-center justify-between rounded-lg border px-4 py-3"
        >
          <span>
            <span className="block font-medium">{m.label}</span>
            {m.id === "password" && (
              <span className="text-text-muted text-xs">{t("passwordMethodHint")}</span>
            )}
          </span>
          <Button variant={m.enabled ? "default" : "outline"} onClick={() => void toggle(m.id)}>
            {m.enabled ? t("enabled") : t("disabled")}
          </Button>
        </div>
      ))}

      {policy && (
        <div className="border-border bg-surface space-y-4 rounded-lg border px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <span>
              <span className="block font-medium">{t("requireBinding")}</span>
              <span className="text-text-muted text-xs">{t("requireBindingHint")}</span>
            </span>
            <Button
              variant={policy.require_third_party_binding ? "default" : "outline"}
              onClick={() =>
                void savePolicy({
                  require_third_party_binding: !policy.require_third_party_binding,
                  max_players: policy.max_players,
                })
              }
            >
              {policy.require_third_party_binding ? t("enabled") : t("disabled")}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span>
              <span className="block font-medium">{t("maxPlayers")}</span>
              <span className="text-text-muted text-xs">{t("maxPlayersHint")}</span>
            </span>
            <Input
              // key 让服务端值变化时重挂载：输入框本身是非受控的（失焦才提交）
              key={policy.max_players}
              type="number"
              min={1}
              className="w-24"
              defaultValue={policy.max_players}
              aria-label={t("maxPlayers")}
              onBlur={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n) && n >= 1 && n !== policy.max_players) {
                  void savePolicy({
                    require_third_party_binding: policy.require_third_party_binding,
                    max_players: Math.floor(n),
                  });
                }
              }}
            />
          </div>

          <p className="text-text-muted text-xs">
            {passwordEnabled
              ? t("passwordOnNote")
              : t("passwordOnlyCount", { n: policy.password_only_users })}
          </p>
        </div>
      )}
    </div>
  );
}
