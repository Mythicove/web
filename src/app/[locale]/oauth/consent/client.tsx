"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Loader2Icon, ShieldCheckIcon, ShieldQuestionIcon } from "lucide-react";
import { apiClient, apiBase } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/skeleton";

interface ConsentInfo {
  client_id: string;
  client_name: string;
  scopes: string[];
}

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

function OAuthConsentInner() {
  const t = useTranslations("oauth");
  const errText = useErrorText();
  const params = useSearchParams();
  const challenge = params.get("challenge") ?? "";
  const [info, setInfo] = useState<ConsentInfo | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<"" | "approve" | "deny">("");

  useEffect(() => {
    if (!challenge) return;
    let cancelled = false;
    apiClient
      .oauthConsentInfo(challenge)
      .then((i) => {
        if (!cancelled) setInfo(i);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [challenge]);

  const decide = async (accept: boolean) => {
    if (busy || !challenge) return;
    setBusy(accept ? "approve" : "deny");
    try {
      const r = accept
        ? await apiClient.oauthConsentAccept(challenge)
        : await apiClient.oauthConsentReject(challenge);
      window.location.assign(apiBase + r.redirectTo);
    } catch (e) {
      setFailed(true);
      setBusy("");
      void errText(e);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        {!challenge || failed ? (
          <InvalidChallenge />
        ) : (
          <Card className="bg-surface shadow-card w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <ShieldCheckIcon className="text-highlight size-5" />
                {t("consentTitle", { client: info?.client_name ?? "…" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!info ? (
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <>
                  <p className="text-text-muted text-sm">{t("consentHint")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {info.scopes.map((s) => (
                      <Badge key={s} variant="outline">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  disabled={busy !== "" || !info}
                  onClick={() => void decide(true)}
                >
                  {busy === "approve" && <Loader2Icon className="animate-spin" />}
                  {t("approve")}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={busy !== "" || !info}
                  onClick={() => void decide(false)}
                >
                  {busy === "deny" && <Loader2Icon className="animate-spin" />}
                  {t("deny")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function OAuthConsentPage() {
  return (
    <Suspense>
      <OAuthConsentInner />
    </Suspense>
  );
}
