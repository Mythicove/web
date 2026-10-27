"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Loader2Icon } from "lucide-react";
import { apiClient, type RegisterRequirements } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { Captcha } from "@/components/captcha";
import { Link } from "@/i18n/navigation";

export function RegisterPageClient() {
  const t = useTranslations("auth");
  const errText = useErrorText();
  const [form, setForm] = useState({ email: "", password: "", nickname: "", playerName: "" });
  const [inviteCode, setInviteCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [req, setReq] = useState<RegisterRequirements | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [passwordSignup, setPasswordSignup] = useState(true);

  useEffect(() => {
    apiClient
      .registerRequirements()
      .then(setReq)
      .catch(() => setReq(null));
    // 管理员关掉主密码登录时，账号密码注册也一并关闭（后端同一条策略）：
    // 否则新号一出生就登不进来。首次第三方登录会自动建号，故引导去登录页。
    apiClient
      .listLoginMethods()
      .then((r) => setPasswordSignup(r.methods.some((m) => m.type === "password" && m.enabled)))
      .catch(() => setPasswordSignup(true));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus(null);
    setError(null);
    try {
      await apiClient.register({
        ...form,
        inviteCode: inviteCode || undefined,
        captchaToken: captchaToken || undefined,
      });
      setStatus(t("registerOk"));
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="bg-surface shadow-card w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-display">{t("registerTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {req?.registrationDisabled ? (
              <p className="text-text-muted text-sm">{t("registerDisabled")}</p>
            ) : !passwordSignup ? (
              <p className="text-text-muted text-sm">
                {t("passwordSignupDisabled")}{" "}
                <Link href="/login" className="hover:text-text underline underline-offset-2">
                  {t("toLogin")}
                </Link>
              </p>
            ) : (
              <form onSubmit={(e) => void submit(e)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                  {req?.emailDomains.length ? (
                    <p className="text-text-muted text-xs">
                      {t("emailDomains", { domains: req.emailDomains.join(", ") })}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={req?.minPasswordLength ?? 8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  {req && (
                    <p className="text-text-muted text-xs">
                      {t("passwordMin", { n: req.minPasswordLength })}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nickname">{t("nickname")}</Label>
                  <Input
                    id="nickname"
                    name="nickname"
                    autoComplete="nickname"
                    required
                    maxLength={32}
                    value={form.nickname}
                    onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="playerName">{t("playerName")}</Label>
                  <Input
                    id="playerName"
                    name="playerName"
                    autoComplete="username"
                    required
                    maxLength={16}
                    value={form.playerName}
                    onChange={(e) => setForm({ ...form, playerName: e.target.value })}
                    placeholder="Steve"
                  />
                </div>
                {req?.inviteOnly && (
                  <div className="space-y-1.5">
                    <Label htmlFor="inviteCode">{t("inviteCode")}</Label>
                    <Input
                      id="inviteCode"
                      name="inviteCode"
                      required
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                    />
                  </div>
                )}
                {req?.captcha && req.captchaSiteKey && req.captchaScopes.includes("register") && (
                  <Captcha
                    driver={req.captcha}
                    siteKey={req.captchaSiteKey}
                    capUrl={req.captchaCapUrl}
                    onToken={setCaptchaToken}
                  />
                )}
                {error && (
                  <p role="alert" className="text-danger text-sm">
                    {error}
                  </p>
                )}
                {status && (
                  <p role="status" className="text-success text-sm">
                    {status}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2Icon className="animate-spin" />}
                  {t("registerSubmit")}
                </Button>
              </form>
            )}
            <p className="text-text-muted text-center text-xs">
              <Link href="/login" className="hover:text-text hover:underline">
                {t("toLogin")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
