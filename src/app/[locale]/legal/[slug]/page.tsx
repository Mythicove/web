import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";

const SLUGS = ["terms", "privacy", "dmca"] as const;
type Slug = (typeof SLUGS)[number];

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!(SLUGS as readonly string[]).includes(slug)) return {};
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t(`${slug as Slug}.title`) };
}

export default async function LegalPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!(SLUGS as readonly string[]).includes(slug)) notFound();
  const t = await getTranslations("legal");
  const s = slug as Slug;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <nav className="flex gap-4 text-sm" aria-label={t("nav")}>
            {SLUGS.map((k) => (
              <Link
                key={k}
                href={`/legal/${k}`}
                className={k === s ? "text-primary font-medium" : "text-text-muted hover:text-text"}
              >
                {t(`${k}.title`)}
              </Link>
            ))}
          </nav>
          <h1 className="font-display mt-6 text-2xl font-semibold">{t(`${s}.title`)}</h1>
          <p className="text-text-muted mt-1 text-xs">{t("updated")}</p>
          <div className="text-text-muted mt-6 space-y-4 text-sm leading-relaxed">
            <p className="whitespace-pre-line">{t(`${s}.body`)}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
