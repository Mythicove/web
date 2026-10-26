import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeartIcon, ImagesIcon, SearchIcon } from "lucide-react";
import { apiClient } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { SkinThumb } from "@/components/skin-thumb";
import { PlayerAvatar } from "@/components/player-avatar";
import { SkinFilters } from "./filters";

const LIMIT = 12;

interface PageProps {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("skins") };
}

interface Params {
  params: Promise<{ locale: string }>;
}

export default async function SkinsPage({ searchParams, params }: PageProps & Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("skins");
  const sort = sp.sort === "likes" ? "likes" : "newest";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const q = sp.q?.trim() || undefined;

  // 取数失败直接抛错，交给 skins/error.tsx 边界（带重试）。
  const data = await apiClient.listSkinLib({
    q,
    sort,
    offset: (page - 1) * LIMIT,
    limit: LIMIT,
  });
  const totalPages = Math.max(1, Math.ceil(data.total / LIMIT));

  const pageHref = (over: { q?: string; sort?: string; page?: number }) => {
    const query: Record<string, string> = {};
    const nq = over.q !== undefined ? over.q : q;
    const nsort = over.sort !== undefined ? over.sort : sort;
    const npage = over.page !== undefined ? over.page : page;
    if (nq) query.q = nq;
    if (nsort !== "newest") query.sort = nsort;
    if (npage > 1) query.page = String(npage);
    return { pathname: "/skins" as const, query };
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>
          <SkinFilters q={q ?? ""} sort={sort} />

          {data.items.length === 0 && (
            <EmptyState
              className="mt-8"
              icon={ImagesIcon}
              title={q ? t("noResults", { q }) : t("empty")}
              action={
                q ? (
                  <Button render={<Link href="/skins" />} variant="outline" className="mt-1">
                    <SearchIcon />
                    {t("search")}
                  </Button>
                ) : undefined
              }
            />
          )}

          {data.items.length > 0 && (
            <>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {data.items.map((item) => (
                  <Link key={item.id} href={`/skins/${item.id}`} className="group block">
                    <Card className="bg-surface group-hover:shadow-lift transition-all group-hover:-translate-y-0.5">
                      <CardContent className="p-5">
                        <SkinThumb
                          src={apiClient.skinTextureUrl(item.texture_key)}
                          alt={item.player_name}
                        />
                        <div className="mt-4 flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-2">
                            <PlayerAvatar name={item.player_name} size={26} />
                            <span className="font-display truncate font-medium">
                              {item.player_name}
                            </span>
                          </span>
                          <Badge variant="secondary">{item.model}</Badge>
                        </div>
                        <p className="text-text-muted mt-2 line-clamp-2 text-sm">
                          {item.description || t("noDesc")}
                        </p>
                        <div className="text-text-muted mt-3 flex items-center gap-1.5 text-xs">
                          <HeartIcon className="size-3.5" />
                          {t("likes", { count: item.likes })}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <span className="text-text-muted text-sm">
                  {t("pageInfo", { page, total: totalPages })}
                </span>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  href={(p) => pageHref({ page: p })}
                  labels={{ prev: t("prev"), next: t("next"), aria: t("title") }}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
