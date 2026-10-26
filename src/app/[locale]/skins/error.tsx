"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { useErrorText } from "@/lib/errors";

export default function SkinsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("skins");
  const errText = useErrorText();

  useEffect(() => {
    toast.error(errText(error));
  }, [error, errText]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="border-border bg-surface shadow-card w-full max-w-md rounded-xl border p-6">
          <div className="flex items-center gap-2">
            <TriangleAlertIcon className="text-warning size-5" />
            <h1 className="font-display text-lg font-semibold">{t("loadFailed")}</h1>
          </div>
          <p className="text-text-muted mt-2 text-sm">{errText(error)}</p>
          <details className="border-border bg-bg text-text-muted mt-4 rounded-md border p-2 text-xs">
            <summary className="cursor-pointer select-none">{t("techDetail")}</summary>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap">{error.message}</pre>
          </details>
          <Button className="mt-5 w-full" onClick={reset}>
            <RotateCcwIcon />
            {t("retry")}
          </Button>
        </div>
      </main>
    </div>
  );
}
