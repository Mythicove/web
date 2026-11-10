import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { ServerStatus } from "@/components/server-status";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { readServers } from "@/lib/isles-server";

type Params = { params: Promise<{ locale: string; id: string }> };
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const { servers } = await readServers();
  return { title: servers.find((s) => s.id === id)?.name };
}
export default async function Server({ params }: Params) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("isles");
  const { servers, available } = await readServers();
  const server = servers.find((s) => s.id === id);
  if (!available) throw new Error("Server directory unavailable");
  if (!server) notFound();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/servers" className="text-text-muted text-sm hover:underline">
          {t("back")}
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            {server.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- World screenshots are supplied by the deploying community, not a fixed image provider.
              <img
                src={server.coverUrl}
                alt=""
                className="mb-8 aspect-video w-full rounded-lg object-cover"
              />
            )}
            <h1 className="font-display text-4xl font-semibold">{server.name}</h1>
            <p className="text-text-muted mt-6 leading-relaxed whitespace-pre-line">
              {server.description}
            </p>
            {server.map && (
              <div className="mt-6">
                <Button render={<Link href={`/servers/${server.id}/map`} />} variant="outline">
                  {t("worldMap")}
                </Button>
              </div>
            )}
            {(server.links?.length ?? 0) > 0 && (
              <div className="mt-10 border-t pt-6">
                <h2 className="font-display text-xl font-semibold">{t("links")}</h2>
                <p className="text-text-muted mt-2 text-sm">{t("mapHint")}</p>
                <nav className="mt-5 grid gap-2">
                  {server.links.map((link, index) => (
                    <a
                      key={`${link.url}-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-border hover:bg-surface-raised flex items-center justify-between gap-4 rounded-md border px-4 py-3"
                    >
                      <span>{link.label || link.kind}</span>
                      <span className="text-text-muted text-xs">{link.kind}</span>
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </section>
          <aside className="border-border bg-surface h-fit rounded-lg border p-6">
            <p className="text-text-muted mb-5 text-sm">
              {server.edition === "java" ? "Java Edition" : "Bedrock Edition"}
            </p>
            <ServerStatus id={server.id} address={server.address} />
            {server.packVersion && (
              <Button
                className="mt-6 w-full"
                render={<a href={`/api/isles/packs/${server.packVersion}`} />}
              >
                {t("download")}
              </Button>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
