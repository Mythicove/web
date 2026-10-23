"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function SkinsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("skins");
  useEffect(() => {
    toast.error(t("loadFailed"));
  }, [error, t]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <p className="text-sm text-danger">{error.message || t("loadFailed")}</p>
      <Button variant="outline" onClick={reset}>
        {t("retry")}
      </Button>
    </div>
  );
}
