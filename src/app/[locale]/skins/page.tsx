import { getTranslations } from "next-intl/server";
import { apiClient, type SkinLibPage } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkinFilters } from "./filters";

const LIMIT = 12;

interface PageProps {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}

export default async function SkinsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const t = await getTranslations("skins");
  const sort = sp.sort === "likes" ? "likes" : "newest";
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const q = sp.q?.trim() || undefined;

  let data: SkinLibPage | null = null;
  try {
    data = await apiClient.listSkinLib({
      q,
      sort,
      offset: (page - 1) * LIMIT,
      limit: LIMIT,
    });
  } catch {
    data = null;
  }
  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;

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

          {data === null && (
            <p className="mt-6 text-sm text-danger">{t("loadFailed")}</p>
          )}
          {data !== null && data.items.length === 0 && (
            <p className="mt-6 text-sm text-text-muted">{t("empty")}</p>
          )}

          {data !== null && data.items.length > 0 && (
            <>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {data.items.map((item) => (
                  <Link key={item.id} href={`/skins/${item.id}`} className="block">
                    <Card className="bg-surface transition hover:bg-surface-raised">
                      <CardContent className="p-5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={apiClient.skinTextureUrl(item.texture_key)}
                          alt={item.player_name}
                          className="h-40 w-full rounded-md object-contain bg-bg"
                        />
                        <div className="mt-4 flex items-center justify-between">
                          <span className="font-display font-medium">{item.player_name}</span>
                          <Badge variant="secondary">{item.model}</Badge>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                          {item.description || t("noDesc")}
                        </p>
                        <div className="mt-3 text-xs text-text-muted">
                          {t("likes", { count: item.likes })}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <span className="text-sm text-text-muted">
                  {t("pageInfo", { page, total: totalPages })}
                </span>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link href={pageHref({ page: page - 1 })}>
                      <Button variant="outline">{t("prev")}</Button>
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link href={pageHref({ page: page + 1 })}>
                      <Button variant="outline">{t("next")}</Button>
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
