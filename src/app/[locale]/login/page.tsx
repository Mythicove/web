"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [form, setForm] = useState({ email: "", password: "" });
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      const res = await apiClient.authenticate(form.email, form.password);
      localStorage.setItem("accessToken", res.accessToken);
      setToken(res.accessToken);
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md bg-surface">
          <CardHeader>
            <CardTitle className="font-display">{t("loginTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            {token && <p className="text-sm text-success">{t("loginOk")}</p>}
            <Button className="w-full" onClick={submit}>
              {t("submit")}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
