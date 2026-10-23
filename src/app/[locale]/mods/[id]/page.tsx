"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  hoardClient,
  ApiError,
  type HoardDependency,
  type HoardProject,
  type HoardVersion,
} from "@/lib/api";
import { useHoardUser } from "@/lib/hoard-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

export default function ModDetailPage() {
  const t = useTranslations("modDetail");
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user, loaded } = useHoardUser();

  const [project, setProject] = useState<HoardProject | null>(null);
  const [versions, setVersions] = useState<HoardVersion[]>([]);
  const [deps, setDeps] = useState<HoardDependency[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    hoardClient
      .project(id)
      .then(setProject)
      .catch((e) => setError(String(e)));
    hoardClient
      .versions(id)
      .then(setVersions)
      .catch(() => {});
    hoardClient
      .dependencies(id)
      .then(setDeps)
      .catch(() => {});
  }, [id]);

  useEffect(load, [load]);

  // 发版表单
  const [vForm, setVForm] = useState({ version_number: "", name: "", version_type: "release", changelog: "" });
  const [vFile, setVFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);

  const publishVersion = async () => {
    if (!vFile || !vForm.version_number) return;
    setPublishing(true);
    try {
      await hoardClient.addVersion(
        {
          project_id: id,
          name: vForm.name || vForm.version_number,
          version_number: vForm.version_number,
          version_type: vForm.version_type,
          changelog: vForm.changelog,
        },
        vFile,
      );
      toast.success(t("versionPublished"));
      setVForm({ version_number: "", name: "", version_type: "release", changelog: "" });
      setVFile(null);
      load();
    } catch (e) {
      toast.error(e instanceof ApiError && e.status === 403 ? t("notMember") : String(e));
    } finally {
      setPublishing(false);
    }
  };

  const remove = async () => {
    try {
      await hoardClient.deleteProject(id);
      toast.success(t("deleted"));
      window.location.href = "/mods";
    } catch (e) {
      toast.error(String(e));
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-6 py-12 text-sm text-danger">{error}</div>
        </main>
      </div>
    );
  }
  if (!project) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-6 py-12 text-sm text-text-muted">{t("loading")}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="flex items-start gap-4">
            {project.icon_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={project.icon_url} alt="" className="h-16 w-16 rounded-lg" />
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
              <p className="mt-1 text-sm text-text-muted">{project.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(project.loaders ?? []).map((l) => (
                  <Badge key={l} variant="outline">
                    {l}
                  </Badge>
                ))}
                {(project.game_versions ?? []).map((v) => (
                  <Badge key={v} variant="outline">
                    {v}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {project.body && (
            <Card className="mt-6 bg-surface">
              <CardContent className="whitespace-pre-wrap p-5 text-sm">{project.body}</CardContent>
            </Card>
          )}

          {deps.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-lg font-semibold">{t("dependencies")}</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {deps.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{d.dependency_type}</Badge>
                    {d.project_id && (
                      <Link className="text-highlight hover:underline" href={`/mods/${d.project_id}`}>
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
                <Card key={v.id} className="bg-surface">
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
                      {v.name && <p className="mt-0.5 text-xs text-text-muted">{v.name}</p>}
                      {v.changelog && (
                        <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-text-muted">
                          {v.changelog}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 text-xs">
                      {(v.files ?? []).map((f, i) => (
                        <a
                          key={`${f.filename}-${i}`}
                          className="text-highlight hover:underline"
                          href={f.url}
                        >
                          {f.filename}
                        </a>
                      ))}
                      <a
                        className="text-highlight hover:underline"
                        href={hoardClient.mrpackUrl(project.id, v.id)}
                      >
                        .mrpack
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {versions.length === 0 && (
                <p className="text-sm text-text-muted">{t("noVersions")}</p>
              )}
            </div>
          </section>

          {loaded && user && (
            <section className="mt-8 rounded-lg border border-border bg-surface p-5">
              <h2 className="font-display text-lg font-semibold">{t("publishVersion")}</h2>
              <p className="mt-1 text-xs text-text-muted">{t("publishHint")}</p>
              <div className="mt-4 grid max-w-xl gap-3 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>{t("versionNumber")}</Label>
                  <Input
                    value={vForm.version_number}
                    onChange={(e) => setVForm({ ...vForm, version_number: e.target.value })}
                    placeholder="1.1.0"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>{t("versionNameOpt")}</Label>
                  <Input
                    value={vForm.name}
                    onChange={(e) => setVForm({ ...vForm, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5 md:col-span-2">
                  <Label>{t("changelogOpt")}</Label>
                  <Input
                    value={vForm.changelog}
                    onChange={(e) => setVForm({ ...vForm, changelog: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5 md:col-span-2">
                  <Label>{t("file")}</Label>
                  <Input type="file" onChange={(e) => setVFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>
              <Button className="mt-4" onClick={publishVersion} disabled={publishing}>
                {t("publish")}
              </Button>
              {user.role === "admin" && (
                <Button className="mt-4 ml-3" variant="destructive" onClick={remove}>
                  {t("deleteProject")}
                </Button>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
