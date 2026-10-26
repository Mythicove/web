import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import OAuthLoginClient from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "oauth" });
  return { title: t("loginTitle") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OAuthLoginClient />;
}
