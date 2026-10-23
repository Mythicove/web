"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";

type State = "pending" | "ok" | "fail";

function VerifyInner() {
  const t = useTranslations("account");
  const params = useSearchParams();
  const [state, setState] = useState<State>(() =>
    params.get("token") ? "pending" : "fail",
  );
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const token = params.get("token");
    if (!token) return;
    ran.current = true;
    apiClient
      .verifyEmail(token)
      .then(() => setState("ok"))
      .catch(() => setState("fail"));
  }, [params]);

  return (
    <Card className="w-full max-w-md bg-surface">
      <CardHeader>
        <CardTitle className="font-display">{t("verifyTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {state === "pending" && (
          <p className="text-sm text-text-muted">{t("verifying")}</p>
        )}
        {state === "ok" && (
          <>
            <p className="text-sm text-success">{t("verifyOk")}</p>
            <Link href="/login">
              <Button className="w-full">{t("toLogin")}</Button>
            </Link>
          </>
        )}
        {state === "fail" && (
          <>
            <p className="text-sm text-danger">{t("verifyFail")}</p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                {t("backToLogin")}
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Suspense>
          <VerifyInner />
        </Suspense>
      </main>
    </div>
  );
}
