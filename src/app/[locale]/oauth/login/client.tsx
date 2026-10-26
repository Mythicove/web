"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2Icon, ShieldQuestionIcon } from "lucide-react";
import { apiClient, apiBase, ApiError } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

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
