"use client";

import { useTranslations } from "next-intl";
import { SiteHeader } from "@/components/site-header";

export default function ModsPage() {
  const t = useTranslations("mods");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>
          <p className="mt-4 max-w-xl text-text-muted">{t("desc")}</p>
          <div className="mt-8 rounded-lg border border-dashed border-border p-10 text-center text-sm text-text-muted">
            {t("placeholder")}
          </div>
        </div>
      </main>
    </div>
  );
}
