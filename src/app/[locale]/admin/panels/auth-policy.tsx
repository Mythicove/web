"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { apiClient, type AuthPolicyView } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

// 认证策略面板：强制第三方绑定 + 单账号玩家数上限（mirror settings 存储）。
// 主密码登录开关在「登录方式」页（同一开关单一入口），此处不重复暴露。
export function AuthPolicyPanel({ token }: { token: string | null }) {
  const t = useTranslations("admin");
  const errText = useErrorText();
  const [view, setView] = useState<AuthPolicyView | null>(null);
  const [binding, setBinding] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState("1");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token === null) return;
    apiClient.admin
      .authPolicy(token)
      .then((v) => {
        setView(v);
        setBinding(v.require_third_party_binding ?? false);
        setMaxPlayers(String(v.max_players ?? 1));
      })
      .catch(() => setView(null));
  }, [token]);

  const save = async () => {
    if (token === null || busy) return;
    const n = Number.parseInt(maxPlayers, 10);
    if (!Number.isFinite(n) || n < 1) {
      toast.error(t("policyMaxPlayersInvalid"));
      return;
    }
    setBusy(true);
    try {
      await apiClient.admin.updateAuthPolicy(token, {
        require_third_party_binding: binding,
        max_players: n,
      });
      toast.success(t("saved"));
      const v = await apiClient.admin.authPolicy(token);
      setView(v);
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy(false);
    }
  };

  if (token === null) return <p className="text-text-muted text-sm">{t("needToken")}</p>;

  return (
    <Card className="bg-surface shadow-card max-w-xl">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="text-text-muted size-4" />
          <h2 className="font-display text-sm font-semibold">{t("tab.authPolicy")}</h2>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="policy-binding"
            checked={binding}
            onCheckedChange={(v) => setBinding(v === true)}
          />
          <Label htmlFor="policy-binding" className="font-normal">
            {t("policyRequireBinding")}
          </Label>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="policy-max-players">{t("policyMaxPlayers")}</Label>
          <Input
            id="policy-max-players"
            type="number"
            min={1}
            className="max-w-28"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
          />
        </div>
        {view && view.password_only_users > 0 && (
          <p className="text-text-muted text-xs">
            {t("policyPasswordOnly", { n: view.password_only_users })}
          </p>
        )}
        <Button type="button" disabled={busy} onClick={() => void save()}>
          {busy && <Loader2Icon className="animate-spin" />}
          {t("save")}
        </Button>
      </CardContent>
    </Card>
  );
}
