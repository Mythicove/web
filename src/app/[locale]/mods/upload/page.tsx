import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { readSiteConfig } from "@/lib/site-config-server";
import { ModUploadPageClient } from "./client";

// 壳页不取数：按 locale 预渲染为静态
export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "modUpload" });
  return { title: t("title") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { modules } = await readSiteConfig();
  if (!modules.includes("mods")) notFound();
  return <ModUploadPageClient />;
}
