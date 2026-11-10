import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { readServers } from "@/lib/isles-server";

type Params = { params: Promise<{ locale: string; id: string }> };
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const { servers } = await readServers();
  const t = await getTranslations("isles");
  return { title: `${servers.find((s) => s.id === id)?.name ?? t("title")} / ${t("worldMap")}` };
}

export default async function Page({ params }: Params) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const { servers, available } = await readServers();
  if (!available) throw new Error("Map directory unavailable");
  const server = servers.find((s) => s.id === id);
  if (!server?.map) notFound();
  const t = await getTranslations("isles");
  const mapOrigin = new URL(server.map.url).origin;
  const allowed = (process.env.ISLES_MAP_ORIGINS ?? "")
    .split(",")
    .filter(Boolean)
    .map((value) => new URL(value.trim()).origin);
  const siteOrigin = process.env.NEXT_PUBLIC_WEB_URL
    ? new URL(process.env.NEXT_PUBLIC_WEB_URL).origin
    : "http://localhost:3000";
  const embedded = mapOrigin === siteOrigin || allowed.includes(mapOrigin);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col px-4 py-5 sm:px-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href={`/servers/${id}`} className="text-text-muted text-sm hover:underline">
              {server.name}
            </Link>
            <h1 className="font-display mt-1 text-xl font-semibold">{t("worldMap")}</h1>
          </div>
          <a
            href={server.map.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline"
          >
            {t("openMap")}
          </a>
        </header>
        <p className="text-text-muted mb-4 max-w-4xl text-xs leading-relaxed">{t("mapHint")}</p>
        {embedded ? (
          <iframe
            src={server.map.url}
            title={`${server.name} / ${t("worldMap")}`}
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-pointer-lock"
            referrerPolicy="no-referrer"
            className="bg-surface min-h-[65vh] w-full flex-1 rounded-md border"
          />
        ) : (
          <p className="text-text-muted rounded-md border p-6 text-sm">{t("mapOriginMissing")}</p>
        )}
      </main>
    </div>
  );
}
