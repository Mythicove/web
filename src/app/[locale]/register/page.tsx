"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const [form, setForm] = useState({ email: "", password: "", nickname: "", playerName: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setStatus(null);
    setError(null);
    try {
      await apiClient.register(form);
      setStatus(t("registerOk"));
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
            <CardTitle className="font-display">{t("registerTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nickname">{t("nickname")}</Label>
              <Input
                id="nickname"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="playerName">{t("playerName")}</Label>
              <Input
                id="playerName"
                value={form.playerName}
                onChange={(e) => setForm({ ...form, playerName: e.target.value })}
                placeholder="Steve"
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            {status && <p className="text-sm text-success">{status}</p>}
            <Button className="w-full" onClick={submit}>
              {t("submit")}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
