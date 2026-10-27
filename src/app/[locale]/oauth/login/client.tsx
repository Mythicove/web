"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2Icon, ShieldQuestionIcon } from "lucide-react";
import { apiClient, apiBase, ApiError, type LoginMethod } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";

function InvalidChallenge() {
  const t = useTranslations("oauth");
  return (
    <Card className="bg-surface shadow-card w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <ShieldQuestionIcon className="text-warning size-8" />
        <p className="text-text-muted text-sm">{t("invalid")}</p>
      </CardContent>
    </Card>
  );
}

function OAuthLoginInner() {
  const t = useTranslations("oauth");
  const errText = useErrorText();
  const params = useSearchParams();
  const challenge = params.get("challenge") ?? "";
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [methods, setMethods] = useState<LoginMethod[] | null>(null);

  useEffect(() => {
    apiClient
      .listLoginMethods()
      .then((r) => setMethods(r.methods.filter((m) => m.enabled)))
      .catch(() => setMethods([]));
  }, []);

  // 加载完成前按"可用"处理，避免先闪一段"已关闭"的提示。
  // 关闭时这张表单必然是死路（后端会以 password_login_disabled 拒绝），
  // 改为把人送去站点登录页：那里有第三方登录按钮，登录后 mirror 会直接继承 web 会话。
  const passwordEnabled = methods === null || methods.some((m) => m.type === "password");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !challenge) return;
    setBusy(true);
    setError(null);
    try {
      const r = await apiClient.oauthLoginAccept(challenge, form.email, form.password);
      // 交回 IdP 授权端点（同源顶层导航，会话 cookie 在此落下）
      window.location.assign(apiBase + r.redirectTo);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? t("badCredentials") : errText(err));
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        {!challenge ? (
          <InvalidChallenge />
        ) : (
          <Card className="bg-surface shadow-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-display">{t("loginTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-text-muted text-sm">{t("loginHint")}</p>
              {passwordEnabled ? (
                <form onSubmit={(e) => void submit(e)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">{t("password")}</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                  {error && (
                    <p role="alert" className="text-danger text-sm">
                      {error}
                    </p>
                  )}
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2Icon className="animate-spin" />}
                    {t("submit")}
                  </Button>
                </form>
              ) : (
                <div className="space-y-3">
                  <p className="text-text-muted text-sm">{t("passwordDisabled")}</p>
                  <Button className="w-full" render={<Link href="/login" />}>
                    {t("goToLogin")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function OAuthLoginPage() {
  return (
    <Suspense>
      <OAuthLoginInner />
    </Suspense>
  );
}
