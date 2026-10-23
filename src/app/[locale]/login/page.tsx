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
  const { login, completeOAuthLogin, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [methods, setMethods] = useState<LoginMethod[]>([]);

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
                  <Label>{t("email")}</Label>
                  <Input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("password")}</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
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
