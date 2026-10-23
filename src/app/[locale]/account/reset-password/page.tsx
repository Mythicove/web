"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";

function ResetInner() {
  const t = useTranslations("account");
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!token) {
      setError(t("verifyFail"));
      return;
    }
    if (form.password !== form.confirm) {
      setError(t("passwordMismatch"));
      return;
    }
    try {
      await apiClient.resetPassword(token, form.password);
      setOk(true);
    } catch {
      setError(t("resetFail"));
    }
  };

  return (
    <Card className="w-full max-w-md bg-surface">
      <CardHeader>
        <CardTitle className="font-display">{t("resetTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ok ? (
          <>
            <p className="text-sm text-success">{t("resetOk")}</p>
            <Link href="/login">
              <Button className="w-full">{t("toLogin")}</Button>
            </Link>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>{t("newPassword")}</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("confirmPassword")}</Label>
              <Input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button className="w-full" onClick={submit}>
              {t("resetTitle")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Suspense>
          <ResetInner />
        </Suspense>
      </main>
    </div>
  );
}
