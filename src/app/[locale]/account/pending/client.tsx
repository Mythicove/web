"use client";

import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2Icon, MailCheckIcon } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";

function PendingInner() {
  const t = useTranslations("account");
  const errText = useErrorText();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resend = async () => {
    if (busy || !email) return;
    setBusy(true);
    setSent(false);
    setError(null);
    try {
      await apiClient.resendVerification(email);
      setSent(true);
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
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <MailCheckIcon className="text-success size-9" aria-hidden="true" />
            <h1 className="font-display text-lg font-semibold">{t("pendingTitle")}</h1>
            <p className="text-text-muted text-sm leading-relaxed">
              {email ? t("pendingBody", { email }) : t("pendingBodyNoEmail")}
            </p>
            <ul className="text-text-muted grid gap-1.5 text-left text-xs leading-relaxed">
              <li>{t("pendingSpam")}</li>
              <li>{t("pendingExpired")}</li>
            </ul>
            {email && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={busy}
                onClick={() => void resend()}
              >
                {busy && <Loader2Icon className="animate-spin" />}
                {t("pendingResend")}
              </Button>
            )}
            {sent && (
              <p role="status" className="text-success text-xs">
                {t("pendingResendSent")}
              </p>
            )}
            {error && (
              <p role="alert" className="text-danger text-xs">
                {error}
              </p>
            )}
            <p className="text-text-muted text-xs">
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

export function PendingPageClient() {
  return (
    <Suspense>
      <PendingInner />
    </Suspense>
  );
}
