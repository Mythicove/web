import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { ServerStatus } from "@/components/server-status";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { readServers } from "@/lib/isles-server";

// Configuration is optional at build time and may be enabled at runtime.
// Never freeze an empty directory into the production image.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("isles");
  return { title: t("title") };
}

export default async function Servers({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("isles");
  const { servers, available } = await readServers();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b pb-8">
          <div>
            <h1 className="font-display text-4xl font-semibold">{t("title")}</h1>
            <p className="text-text-muted mt-3">{t("intro")}</p>
          </div>
          <Link href="/game" className="text-primary text-sm hover:underline">
            {t("gameProfile")}
          </Link>
        </div>
        {servers.length === 0 ? (
          <p role={available ? undefined : "alert"} className="text-text-muted py-12">
            {t(available ? "empty" : "unavailable")}
          </p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {servers.map((server) => (
              <article
                key={server.id}
                className="border-border bg-surface overflow-hidden rounded-lg border"
              >
                {server.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- Configured world screenshots are administrator-owned external assets; dimensions and origins vary by deployment.
                  <img
                    src={server.coverUrl}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                )}
                <div className="p-6">
                  <p className="text-text-muted text-xs">
                    {server.edition === "java" ? "Java Edition" : "Bedrock Edition"}
                  </p>
                  <h2 className="font-display mt-2 text-2xl font-semibold">
                    <Link href={`/servers/${server.id}`} className="hover:underline">
                      {server.name}
                    </Link>
                  </h2>
                  <p className="text-text-muted mt-3 mb-6 text-sm leading-relaxed whitespace-pre-line">
                    {server.description}
                  </p>
                  <ServerStatus id={server.id} address={server.address} />
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button render={<Link href={`/servers/${server.id}`} />} variant="outline">
                      {t("details")}
                    </Button>
                    {server.packVersion && (
                      <Button render={<a href={`/api/isles/packs/${server.packVersion}`} />}>
                        {t("download")}
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
