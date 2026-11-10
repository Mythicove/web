import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogClient } from "./client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("isles");
  return { title: t("catalogTitle") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <CatalogClient />;
}
