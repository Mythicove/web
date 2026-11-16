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
import { readSiteConfig } from "@/lib/site-config-server";
import { readServers } from "@/lib/isles-server";
import { CommunityHome } from "@/components/community-home";
import { cn } from "@/lib/utils";

// 像素网格底纹：Minecraft 视觉锚点，全站系统母题（体素极简 §motif），仅作背景不参与交互。
// opacity 由调用点决定：hero 极淡做环境纹理，"how" 段稍强做分区标识。
function PixelGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)] [background-size:32px_32px]",
        className,
      )}
    />
  );
}

// Server deployments publish worlds at runtime; do not freeze an empty portal at build time.
export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { modules } = await readSiteConfig();
  const { servers, available } = await readServers();
  if (servers.length > 0 || !available)
    return (
      <CommunityHome
        servers={servers}
        hasSkin={modules.includes("skin")}
        hasMods={modules.includes("mods")}
      />
    );
  return <HomeContent hasSkin={modules.includes("skin")} hasMods={modules.includes("mods")} />;
}

function HomeContent({ hasSkin, hasMods }: { hasSkin: boolean; hasMods: boolean }) {
  const t = useTranslations();
  const steps = [1, 2, 3].map((n) => ({
    title: t(`home.step${n}`),
    body: t(`home.step${n}Body`),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero：唯一"敢下重手"的时刻——超大标题 + 发光展台上的真实皮肤 */}
        <section className="border-border relative overflow-hidden border-b">
          <PixelGrid className="opacity-25" />
          {/* 草绿环境光：从展台方向漫出，克制、不喧宾（体素极简 §depth） */}
          <div
            aria-hidden="true"
            className="bg-primary/12 pointer-events-none absolute top-1/2 -right-24 size-[520px] -translate-y-1/2 rounded-full blur-[130px]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-24 lg:grid-cols-2 lg:py-32">
            <div>
              <span className="border-border bg-surface text-text-muted inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium">
                <BoxIcon className="text-primary size-3.5" />
                Yggdrasil API
              </span>
              <h1 className="font-display mt-6 text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                {t("home.hero1")}
                <br />
                {t("home.hero2")}
              </h1>
              <p className="text-text-muted mt-7 max-w-md text-lg leading-relaxed">
                {t("home.desc")}
              </p>
              {hasSkin && (
                <div className="mt-10 flex flex-wrap gap-3">
                  <Button render={<Link href="/profile" />} size="xl">
                    <UploadIcon />
                    {t("home.ctaUpload")}
                  </Button>
                  <Button render={<Link href="/skins" />} variant="outline" size="xl">
                    <ImagesIcon />
                    {t("home.ctaLibrary")}
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-center lg:justify-end">
              <SkinPreview skinUrl="/skins/steve.png" className="max-w-[360px]" />
            </div>
          </div>
        </section>

        {/* How：三步是真实序列，序号做成 MC 物品栏格子（母题），非零填充高亮数字 */}
        <section className="border-border relative overflow-hidden border-b">
          <PixelGrid className="opacity-40" />
          <div className="relative mx-auto max-w-6xl px-6 py-20">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              {t("home.howTitle")}
            </h2>
            <ol className="mt-10 grid gap-10 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <span className="font-display border-border bg-surface-raised shadow-card text-primary inline-flex size-10 items-center justify-center rounded-md border text-sm font-semibold">
                    {i + 1}
                  </span>
                  <h3 className="font-display mt-4 text-lg font-medium">{s.title}</h3>
                  <p className="text-text-muted mt-2 text-sm leading-relaxed">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section>
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-20 lg:grid-cols-5">
            {hasSkin && (
              <article className="border-border bg-surface shadow-card hover:shadow-lift relative isolate flex flex-col overflow-hidden rounded-xl border p-7 transition-shadow lg:col-span-3">
                <PixelGrid className="-z-10 opacity-[0.35]" />
                <HeartIcon className="text-primary size-5" />
                <h3 className="font-display mt-4 text-xl font-semibold">
                  {t("home.featLibTitle")}
                </h3>
                <p className="text-text-muted mt-2 flex-1 text-sm leading-relaxed">
                  {t("home.featLibBody")}
                </p>
                <Link
                  href="/skins"
                  className="text-primary mt-6 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  {t("home.ctaLibrary")}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </article>
            )}
            <div className="grid gap-6 lg:col-span-2">
              <article className="border-border bg-surface shadow-card hover:shadow-lift rounded-xl border p-7 transition-shadow">
                <BadgeCheckIcon className="text-success size-5" />
                <h3 className="font-display mt-4 text-lg font-semibold">
                  {t("home.featPremiumTitle")}
                </h3>
                <p className="text-text-muted mt-2 text-sm leading-relaxed">
                  {t("home.featPremiumBody")}
                </p>
              </article>
              {hasMods && (
                <article className="border-border bg-surface shadow-card hover:shadow-lift rounded-xl border p-7 transition-shadow">
                  <PackageIcon className="text-highlight size-5" />
                  <h3 className="font-display mt-4 text-lg font-semibold">
                    {t("home.featModsTitle")}
                  </h3>
                  <p className="text-text-muted mt-2 text-sm leading-relaxed">
                    {t("home.featModsBody")}
                  </p>
                </article>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-border border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <Logo />
          <nav className="flex gap-5 text-sm" aria-label={t("legal.nav")}>
            <Link href="/legal/terms" className="text-text-muted hover:text-text transition-colors">
              {t("legal.terms.title")}
            </Link>
            <Link
              href="/legal/privacy"
              className="text-text-muted hover:text-text transition-colors"
            >
              {t("legal.privacy.title")}
            </Link>
            <Link href="/legal/dmca" className="text-text-muted hover:text-text transition-colors">
              {t("legal.dmca.title")}
            </Link>
          </nav>
          <p className="text-text-muted text-sm">{t("home.footer")}</p>
        </div>
      </footer>
    </div>
  );
}
