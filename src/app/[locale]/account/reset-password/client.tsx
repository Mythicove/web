"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";

function ResetInner() {
  const t = useTranslations("account");
  const errText = useErrorText();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    if (!token) {
      setError(t("verifyFail"));
      setBusy(false);
      return;
    }
    if (form.password !== form.confirm) {
      setError(t("passwordMismatch"));
      setBusy(false);
      return;
    }
    try {
      await apiClient.resetPassword(token, form.password);
      setOk(true);
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="bg-surface shadow-card w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-display">{t("resetTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ok ? (
          <>
            <p role="status" className="text-success text-sm">
              {t("resetOk")}
            </p>
            <Button render={<Link href="/login" />} className="w-full">
              {t("toLogin")}
            </Button>
          </>
        ) : (
          <form onSubmit={(e) => void submit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("newPassword")}</Label>
              <Input
                id="password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">{t("confirmPassword")}</Label>
              <Input
                id="confirm"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
            </div>
            {error && (
              <p role="alert" className="text-danger text-sm">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2Icon className="animate-spin" />}
              {t("resetSubmit")}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export function ResetPasswordPageClient() {
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
