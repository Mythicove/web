"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { apiClient, type LoginMethod } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

export default function LoginPage() {
  const t = useTranslations("auth");
  const ta = useTranslations("account");
  const { login, completeOAuthLogin, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [methods, setMethods] = useState<LoginMethod[]>([]);
  const [forgot, setForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    completeOAuthLogin();
    apiClient
      .listLoginMethods()
      .then((r) => setMethods(r.methods.filter((m) => m.enabled)))
      .catch(() => {});
  }, [completeOAuthLogin]);

  const submit = async () => {
    setError(null);
    try {
      await login(form.email, form.password);
    } catch (e) {
      setError(String(e));
    }
  };

  const submitForgot = async () => {
    setError(null);
    setForgotSent(false);
    try {
      await apiClient.forgotPassword(form.email);
      setForgotSent(true);
    } catch (e) {
      setError(String(e));
    }
  };

  const oauth = (provider: string) => {
    const redirect = window.location.origin + "/login";
    window.location.assign(apiClient.oauthUrl(provider, redirect));
  };

  const oauthMethods = methods.filter((m) => m.type === "oauth");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md bg-surface">
          <CardHeader>
            <CardTitle className="font-display">{t("loginTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAuthenticated ? (
              <p className="text-sm text-success">{t("loginOk")}</p>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="text-xs text-text-muted underline-offset-2 hover:underline"
                    onClick={() => {
                      setForgot(!forgot);
                      setForgotSent(false);
                      setError(null);
                    }}
                  >
                    {ta("forgot")}
                  </button>
                </div>
                {forgot && (
                  <div className="space-y-2 rounded-md border border-border p-3">
                    <p className="text-xs text-text-muted">{ta("forgotHint")}</p>
                    {forgotSent ? (
                      <p className="text-sm text-success">{ta("forgotSent")}</p>
                    ) : (
                      <Button variant="outline" className="w-full" onClick={submitForgot}>
                        {ta("forgotSend")}
                      </Button>
                    )}
                  </div>
                )}
                {error && <p className="text-sm text-danger">{error}</p>}
                <Button className="w-full" onClick={submit}>
                  {t("submit")}
                </Button>

                {oauthMethods.length > 0 && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-text-muted">{t("or")}</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="space-y-2">
                      {oauthMethods.map((m) => (
                        <Button
                          key={m.id}
                          variant="outline"
                          className="w-full"
                          onClick={() => oauth(m.id)}
                        >
                          {t("oauthWith", { provider: m.label })}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
