import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BoxIcon,
  HeartIcon,
  ImagesIcon,
  PackageIcon,
  UploadIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SkinPreview } from "@/components/skin-preview";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

// 像素网格底纹：Minecraft 视觉锚点（设计文档 §5），仅作背景不参与交互。
function PixelGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] [background-size:32px_32px] opacity-40"
    />
  );
}

// 壳页不取数：按 locale 预渲染为静态
export const dynamic = "force-static";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations();
  const steps = [1, 2, 3].map((n) => ({
    title: t(`home.step${n}`),
    body: t(`home.step${n}Body`),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <span className="border-border bg-surface text-text-muted inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
              <BoxIcon className="text-highlight size-3.5" />
              Yggdrasil API
            </span>
            <h1 className="font-display mt-5 text-5xl leading-tight font-semibold tracking-tight">
              {t("home.hero1")}
              <br />
              <span className="text-primary">{t("home.hero2")}</span>
            </h1>
            <p className="text-text-muted mt-6 max-w-md text-lg leading-relaxed">
              {t("home.desc")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button render={<Link href="/profile" />} size="lg">
                <UploadIcon />
                {t("home.ctaUpload")}
              </Button>
              <Button render={<Link href="/skins" />} variant="outline" size="lg">
                <ImagesIcon />
                {t("home.ctaLibrary")}
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <SkinPreview skinUrl="/skins/steve.png" className="max-w-[320px]" />
          </div>
        </section>

        <section className="border-border relative overflow-hidden border-t">
          <PixelGrid />
          <div className="relative mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-display text-2xl font-semibold">{t("home.howTitle")}</h2>
            <ol className="mt-8 grid gap-8 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className="font-display text-highlight text-sm font-semibold">
                    0{i + 1}
                  </span>
                  <h3 className="font-display mt-2 text-lg font-medium">{s.title}</h3>
                  <p className="text-text-muted mt-2 text-sm leading-relaxed">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-border border-t">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 lg:grid-cols-5">
            <article className="border-border bg-surface shadow-card flex flex-col rounded-xl border p-6 lg:col-span-3">
              <HeartIcon className="text-highlight size-5" />
              <h3 className="font-display mt-3 text-xl font-semibold">{t("home.featLibTitle")}</h3>
              <p className="text-text-muted mt-2 flex-1 text-sm leading-relaxed">
                {t("home.featLibBody")}
              </p>
              <Link
                href="/skins"
                className="text-primary mt-6 inline-flex items-center gap-1 text-sm hover:underline"
              >
                {t("home.ctaLibrary")}
                <ArrowRightIcon className="size-4" />
              </Link>
            </article>
            <div className="grid gap-6 lg:col-span-2">
              <article className="border-border bg-surface shadow-card rounded-xl border p-6">
                <BadgeCheckIcon className="text-success size-5" />
                <h3 className="font-display mt-3 text-lg font-semibold">
                  {t("home.featPremiumTitle")}
                </h3>
                <p className="text-text-muted mt-2 text-sm leading-relaxed">
                  {t("home.featPremiumBody")}
                </p>
              </article>
              <article className="border-border bg-surface shadow-card rounded-xl border p-6">
                <PackageIcon className="text-accent size-5" />
                <h3 className="font-display mt-3 text-lg font-semibold">
                  {t("home.featModsTitle")}
                </h3>
                <p className="text-text-muted mt-2 text-sm leading-relaxed">
                  {t("home.featModsBody")}
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-border border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <Logo />
          <nav className="flex gap-4 text-sm" aria-label={t("legal.nav")}>
            <Link href="/legal/terms" className="text-text-muted hover:text-text">
              {t("legal.terms.title")}
            </Link>
            <Link href="/legal/privacy" className="text-text-muted hover:text-text">
              {t("legal.privacy.title")}
            </Link>
            <Link href="/legal/dmca" className="text-text-muted hover:text-text">
              {t("legal.dmca.title")}
            </Link>
          </nav>
          <p className="text-text-muted text-sm">Mythicove · {t("home.footer")}</p>
        </div>
      </footer>
    </div>
  );
}
