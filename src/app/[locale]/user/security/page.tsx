import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfilePageClient } from "../../profile/client";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "profile" });
  return { title: t("navSecurity") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProfilePageClient section="security" />;
}
