"use client";
import { useTranslations } from "next-intl";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("isles");
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-12">
        <h1 className="text-2xl font-semibold">{t("unavailable")}</h1>
        <Button onClick={reset}>{t("retry")}</Button>
      </main>
    </>
  );
}
