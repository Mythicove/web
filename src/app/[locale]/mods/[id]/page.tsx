import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DownloadIcon, FileTextIcon, Link2Icon } from "lucide-react";
import { hoardClient, ApiError } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Markdown } from "@/components/markdown";
import { ModActions, ModMetaBadges } from "./actions";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  try {
    const project = await hoardClient.project(id);
    return { title: project.title, description: project.description };
  } catch {
    const t = await getTranslations({ locale, namespace: "nav" });
    return { title: t("mods") };
  }
}

export default async function ModDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("modDetail");

  let project;
  try {
    project = await hoardClient.project(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  let versions: Awaited<ReturnType<typeof hoardClient.versions>> = [];
  try {
    versions = await hoardClient.versions(id);
  } catch {
    versions = [];
  }
  let deps: Awaited<ReturnType<typeof hoardClient.dependencies>> = [];
  try {
    deps = await hoardClient.dependencies(id);
  } catch {
    deps = [];
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="flex items-start gap-4">
            {project.icon_url && (
              // eslint-disable-next-line @next/next/no-img-element -- 图标来自后端对象存储，尺寸不固定
              <img
                src={project.icon_url}
                alt=""
                className="border-border bg-surface size-16 shrink-0 rounded-xl border object-contain"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-semibold">{project.title}</h1>
                <Badge variant="secondary">{project.project_type}</Badge>
                {project.license && <Badge variant="outline">{project.license}</Badge>}
                {(project.metadata_flags ?? []).map((f) => (
                  <Badge key={f} variant="destructive">
                    {f}
                  </Badge>
                ))}
              </div>
              <p className="text-text-muted mt-1 text-sm">{project.description}</p>
              <ModMetaBadges
                loaders={project.loaders ?? []}
                gameVersions={project.game_versions ?? []}
              />
            </div>
          </div>

          {project.body && (
            <Card className="bg-surface shadow-card mt-6">
              <CardContent className="flex gap-2 p-5">
                <FileTextIcon className="text-text-muted mt-0.5 size-4 shrink-0" />
                <Markdown className="min-w-0 flex-1">{project.body}</Markdown>
              </CardContent>
            </Card>
          )}

          {deps.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
                <Link2Icon className="text-text-muted size-4" />
                {t("dependencies")}
              </h2>
              <ul className="mt-3 space-y-1 text-sm">
                {deps.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{d.dependency_type}</Badge>
                    {d.project_id && (
                      <Link className="text-primary hover:underline" href={`/mods/${d.project_id}`}>
                        {d.project_id}
                      </Link>
                    )}
                    {d.version_id && <span className="text-text-muted">@ {d.version_id}</span>}
                    {d.file_name && <span className="text-text-muted">({d.file_name})</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold">{t("versionsTitle")}</h2>
            <div className="mt-3 space-y-3">
              {versions.map((v) => (
                <Card key={v.id} className="bg-surface shadow-card">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{v.version_number}</span>
                        <Badge variant="outline">{v.version_type}</Badge>
                        {(v.loaders ?? []).map((l) => (
                          <Badge key={l} variant="secondary">
                            {l}
                          </Badge>
                        ))}
                      </div>
                      {v.name && <p className="text-text-muted mt-0.5 text-xs">{v.name}</p>}
                      {v.changelog && (
                        // 原生 details 折叠：不截断内容（旧实现 max-h-16 会静默吃掉长日志），
                        // 也无需客户端 JS。
                        <details className="mt-1 text-xs">
                          <summary className="text-primary cursor-pointer hover:underline">
                            {t("changelog")}
                          </summary>
                          <Markdown className="text-text-muted mt-1">{v.changelog}</Markdown>
                        </details>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {(v.files ?? []).map((f, i) => (
                        <a
                          key={`${f.filename}-${i}`}
                          className="text-primary flex items-center gap-1 hover:underline"
                          href={f.url}
                        >
                          <DownloadIcon className="size-3.5" />
                          {f.filename}
                        </a>
                      ))}
                      <a
                        className="text-primary flex items-center gap-1 hover:underline"
                        href={hoardClient.mrpackUrl(project.id, v.id)}
                      >
                        <DownloadIcon className="size-3.5" />
                        .mrpack
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {versions.length === 0 && <EmptyState icon={FileTextIcon} title={t("noVersions")} />}
            </div>
          </section>

          <ModActions projectId={id} />
        </div>
      </main>
    </div>
  );
}
