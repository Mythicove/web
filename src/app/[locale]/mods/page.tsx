import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DownloadIcon, PackageOpenIcon } from "lucide-react";
import { hoardClient } from "@/lib/api";
import { readSiteConfig } from "@/lib/site-config-server";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Pagination } from "@/components/pagination";
import { ModsSessionBar } from "./session-bar";
import { ModFilters } from "./filters";
import { FacetChips } from "./facet-chips";

const LIMIT = 12;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; loaders?: string; gv?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("mods") };
}

// Modrinth facets 语法：外层 AND、内层 OR → [["loaders:a","loaders:b"],["versions:x"]]
function buildFacets(loaders: string[], versions: string[]) {
  const groups: string[][] = [];
  if (loaders.length > 0) groups.push(loaders.map((l) => `loaders:${l}`));
  if (versions.length > 0) groups.push(versions.map((v) => `versions:${v}`));
  return groups.length > 0 ? JSON.stringify(groups) : undefined;
}

export default async function ModsPage({
  searchParams,
  params,
}: PageProps & { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // 模块门：站点未启用 mods 时整棵子树按 404 处理
  const { modules } = await readSiteConfig();
  if (!modules.includes("mods")) notFound();
  const sp = await searchParams;
  const t = await getTranslations("mods");
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const selLoaders = (sp.loaders ?? "").split(",").filter(Boolean);
  const selVersions = (sp.gv ?? "").split(",").filter(Boolean);

  const [data, facetOpts] = await Promise.all([
    hoardClient.search(q ?? "", (page - 1) * LIMIT, LIMIT, buildFacets(selLoaders, selVersions)),
    hoardClient.facets().catch(() => null),
  ]);
  const totalPages = Math.max(1, Math.ceil(data.total_hits / LIMIT));

  const pageHref = (next: number) => {
    const query: Record<string, string> = {};
    if (q) query.q = q;
    if (selLoaders.length > 0) query.loaders = selLoaders.join(",");
    if (selVersions.length > 0) query.gv = selVersions.join(",");
    if (next > 1) query.page = String(next);
    return { pathname: "/mods" as const, query };
  };
  const baseQuery = pageHref(page).query;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>
              <p className="text-text-muted mt-1 text-sm">{t("desc")}</p>
            </div>
            <ModsSessionBar />
          </div>

          <ModFilters q={q ?? ""} />
          {facetOpts && (
            <FacetChips
              loaders={facetOpts.loaders ?? []}
              gameVersions={facetOpts.game_versions ?? []}
              selectedLoaders={selLoaders}
              selectedVersions={selVersions}
              query={baseQuery}
            />
          )}

          {data.hits.length === 0 ? (
            <EmptyState
              className="mt-8"
              icon={PackageOpenIcon}
              title={q ? t("noResults", { q }) : t("empty")}
            />
          ) : (
            <>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {data.hits.map((m) => (
                  <Link key={m.id} href={`/mods/${m.id}`} className="group block">
                    <Card className="bg-surface group-hover:shadow-lift h-full transition-all group-hover:-translate-y-0.5">
                      <CardContent className="flex h-full flex-col p-5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display truncate font-medium">{m.title}</span>
                          <Badge variant="secondary">{m.project_type}</Badge>
                        </div>
                        <p className="text-text-muted mt-2 line-clamp-2 flex-1 text-sm">
                          {m.description}
                        </p>
                        {(m.loaders ?? []).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {(m.loaders ?? []).map((l) => (
                              <Badge key={l} variant="outline">
                                {l}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="text-text-muted mt-4 flex items-center gap-1.5 text-xs">
                          <DownloadIcon className="size-3.5" />
                          {m.downloads}
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
                  href={pageHref}
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
