import { useTranslations } from "next-intl";
import { SiteHeader } from "@/components/site-header";
import { SkinPreview } from "@/components/skin-preview";

export default function Home() {
  const t = useTranslations();

  const features = [
    { tag: t("home.f1tag"), title: t("home.f1title"), body: t("home.f1body") },
    { tag: t("home.f2tag"), title: t("home.f2title"), body: t("home.f2body") },
    { tag: t("home.f3tag"), title: t("home.f3title"), body: t("home.f3body") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
          <div>
            <h1 className="font-display text-5xl font-semibold leading-tight">
              {t("home.hero1")}
              <br />
              <span className="bg-gradient-to-r from-highlight via-primary to-accent bg-clip-text text-transparent">
                {t("home.hero2")}
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-text-muted">{t("home.desc")}</p>
            <div className="mt-8 flex gap-4">
              <a
                href="#"
                className="rounded-md bg-primary px-6 py-3 font-medium text-white hover:bg-primary-hover"
              >
                {t("home.ctaUpload")}
              </a>
              <a
                href="#"
                className="rounded-md border border-border px-6 py-3 font-medium hover:bg-surface"
              >
                {t("home.ctaLibrary")}
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <SkinPreview skinUrl="/skins/steve.png" />
          </div>
        </section>

        <section id="features" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-display text-2xl font-semibold">{t("home.featuresTitle")}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-lg border border-border bg-surface p-6">
                  <span className="text-xs text-highlight">{f.tag}</span>
                  <h3 className="mt-2 font-display text-lg font-medium">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-text-muted">{t("home.footer")}</div>
      </footer>
    </div>
  );
}
