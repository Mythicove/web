"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2Icon, UserCogIcon } from "lucide-react";
import { apiClient, type RegistrationPolicy } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

const EMPTY: RegistrationPolicy = {
  disableRegistration: false,
  inviteOnly: false,
  emailDomainWhitelist: [],
  captchaScopes: ["register"],
};

// 注册与验证策略面板：这些开关的唯一来源是后台（settings KV）；
// 旧环境变量仅升级时一次性播种，之后不再生效。
export function RegistrationPanel({ token }: { token: string | null }) {
  const t = useTranslations("admin");
  const errText = useErrorText();
  const [p, setP] = useState<RegistrationPolicy>(EMPTY);
  const [domains, setDomains] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token === null) return;
    apiClient.admin
      .registration(token)
      .then((v) => {
        setP(v);
        setDomains((v.emailDomainWhitelist ?? []).join("\n"));
      })
      .catch(() => setP(EMPTY));
  }, [token]);

  const toggleScope = (scope: "register" | "login", on: boolean) => {
    const cur = new Set(p.captchaScopes ?? []);
    if (on) cur.add(scope);
    else cur.delete(scope);
    setP({ ...p, captchaScopes: [...cur] });
  };

  const save = async () => {
    if (busy || token === null) return;
    setBusy(true);
    try {
      const whitelist = domains
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      await apiClient.admin.setRegistration(token, { ...p, emailDomainWhitelist: whitelist });
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
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <UserCogIcon className="text-text-muted size-4" />
          <h2 className="font-display text-sm font-semibold">{t("tab.registration")}</h2>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="reg-disable"
            checked={p.disableRegistration}
            onCheckedChange={(v) => setP({ ...p, disableRegistration: v === true })}
          />
          <Label htmlFor="reg-disable" className="font-normal">
            {t("regDisable")}
          </Label>
        </div>
        <div className="flex items-start gap-2">
          <Checkbox
            id="reg-invite"
            checked={p.inviteOnly}
            onCheckedChange={(v) => setP({ ...p, inviteOnly: v === true })}
          />
          <Label htmlFor="reg-invite" className="font-normal">
            {t("regInviteOnly")}
          </Label>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="reg-domains">{t("regDomains")}</Label>
          <textarea
            id="reg-domains"
            rows={3}
            placeholder={"example.com\norg.cn"}
            className="border-input placeholder:text-text-muted focus-visible:border-ring focus-visible:ring-ring/50 bg-input/15 flex min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>{t("regCaptchaScopes")}</Label>
          <div className="flex gap-4">
            <div className="flex items-start gap-2">
              <Checkbox
                id="reg-scope-register"
                checked={(p.captchaScopes ?? []).includes("register")}
                onCheckedChange={(v) => toggleScope("register", v === true)}
              />
              <Label htmlFor="reg-scope-register" className="font-normal">
                register
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="reg-scope-login"
                checked={(p.captchaScopes ?? []).includes("login")}
                onCheckedChange={(v) => toggleScope("login", v === true)}
              />
              <Label htmlFor="reg-scope-login" className="font-normal">
                login
              </Label>
            </div>
          </div>
        </div>
        <Button type="button" disabled={busy} onClick={() => void save()}>
          {busy && <Loader2Icon className="animate-spin" />}
          {t("save")}
        </Button>
      </CardContent>
    </Card>
  );
}
