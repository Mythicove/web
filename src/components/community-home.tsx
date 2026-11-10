import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { ServerStatus } from "@/components/server-status";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import { readSite } from "@/lib/site-config-server";
import type { IslesServer } from "@/lib/isles";

export async function CommunityHome({
  servers,
  hasSkin,
  hasMods,
}: {
  servers: IslesServer[];
  hasSkin: boolean;
  hasMods: boolean;
}) {
  const t = await getTranslations("isles");
  const legal = await getTranslations("legal");
  const site = await readSite();
  const featured = servers[0];
  if (!featured)
    return (
      <>
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl space-y-5 px-6 py-12">
          <h1 className="font-display text-3xl font-semibold">{site.name || "Mythicove"}</h1>
          <p className="text-text-muted" role="alert">
            {t("unavailable")}
          </p>
          <Link href="/servers" className="text-primary text-sm hover:underline">
            {t("back")}
          </Link>
        </main>
      </>
    );
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 lg:py-12">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {site.name || "Mythicove"}
            </h1>
            <p className="text-text-muted mt-3 max-w-2xl text-sm leading-relaxed">
              {site.description || t("portalIntro")}
            </p>
          </div>
          <Link href="/servers" className="text-primary text-sm font-medium hover:underline">
            {t("portalAllWorlds")}
          </Link>
        </header>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section aria-labelledby="featured-world">
            <article className="overflow-hidden rounded-lg border">
              {featured.coverUrl && (
                <div className="bg-surface overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Self-hosted community screenshots use deployment-configured image origins; no fixed external image loader. */}
                  <img
                    src={featured.coverUrl}
                    alt=""
                    className="aspect-[16/9] w-full object-cover"
                    fetchPriority="high"
                  />
                </div>
              )}
              <div className="bg-surface p-6 sm:p-7">
                <p className="text-text-muted text-xs">
                  {featured.edition === "java" ? "Java Edition" : "Bedrock Edition"}
                </p>
                <h2
                  id="featured-world"
                  className="font-display mt-2 text-2xl font-semibold sm:text-3xl"
                >
                  {featured.name}
                </h2>
                <p className="text-text-muted mt-4 max-w-2xl text-sm leading-relaxed whitespace-pre-line">
                  {featured.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button render={<Link href={`/servers/${featured.id}`} />}>
                    {t("portalEnterWorld")}
                  </Button>
                  {featured.packVersion && (
                    <Button
                      variant="outline"
                      render={<a href={`/api/isles/packs/${featured.packVersion}`} />}
                    >
                      {t("download")}
                    </Button>
                  )}
                </div>
                <div className="mt-7 border-t pt-5">
                  <ServerStatus id={featured.id} address={featured.address} />
                </div>
              </div>
            </article>
            {servers.length > 1 && (
              <section className="mt-8">
                <h3 className="font-display mb-3 text-xl font-semibold">{t("portalMoreWorlds")}</h3>
                <div className="divide-y border-y">
                  {servers.slice(1).map((server) => (
                    <Link
                      key={server.id}
                      href={`/servers/${server.id}`}
                      className="hover:bg-surface flex flex-wrap items-center justify-between gap-3 px-1 py-5"
                    >
                      <span>
                        <span className="block font-medium">{server.name}</span>
                        <span className="text-text-muted mt-1 block text-xs">
                          {server.edition === "java" ? "Java Edition" : "Bedrock Edition"}
                        </span>
                      </span>
                      <code className="text-text-muted text-xs break-all">{server.address}</code>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </section>
          <aside className="min-w-0 space-y-8">
            <section className="bg-surface rounded-lg border p-5">
              <h2 className="font-display text-lg font-semibold">{t("portalYourPlayer")}</h2>
              <p className="text-text-muted mt-3 text-sm leading-relaxed">
                {t("portalPlayerHint")}
              </p>
              <nav className="mt-5 grid gap-3">
                <Link href="/game" className="text-primary text-sm font-medium hover:underline">
                  {t("gameProfile")}
                </Link>
                {hasSkin && (
                  <Link
                    href="/profile"
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    {t("portalWardrobe")}
                  </Link>
                )}
              </nav>
            </section>
            {(featured.links?.length ?? 0) > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold">{t("links")}</h2>
                <nav className="mt-3 divide-y border-y">
                  {featured.links.map((link, index) => (
                    <a
                      key={`${link.url}-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-surface flex items-center justify-between gap-3 py-4 text-sm"
                    >
                      <span>{link.label || link.kind}</span>
                      <span className="text-text-muted text-xs">{link.kind}</span>
                    </a>
                  ))}
                </nav>
              </section>
            )}
            <section>
              <h2 className="font-display text-lg font-semibold">{t("portalResources")}</h2>
              <nav className="mt-4 grid gap-3 text-sm">
                {hasSkin && (
                  <Link href="/skins" className="text-text-muted hover:text-text">
                    {t("portalSkinLibrary")}
                  </Link>
                )}
                {hasMods && (
                  <Link href="/mods" className="text-text-muted hover:text-text">
                    {t("portalLocalContent")}
                  </Link>
                )}
                <Link href="/catalog" className="text-text-muted hover:text-text">
                  {t("catalogTitle")}
                </Link>
              </nav>
            </section>
          </aside>
        </div>
      </main>
      <footer className="mt-8 border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-6 py-7">
          <Logo />
          <nav aria-label={legal("nav")} className="text-text-muted flex flex-wrap gap-5 text-xs">
            <Link href="/legal/terms" className="hover:text-text">
              {legal("terms.title")}
            </Link>
            <Link href="/legal/privacy" className="hover:text-text">
              {legal("privacy.title")}
            </Link>
            <Link href="/legal/dmca" className="hover:text-text">
              {legal("dmca.title")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
