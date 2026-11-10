"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { islesRequest, type CatalogProject, type CatalogVersion } from "@/lib/isles";

type Selection = { project: CatalogProject; versions: CatalogVersion[] };
const control = "border-border bg-surface h-10 rounded-md border px-3 text-sm";

export function CatalogClient() {
  const t = useTranslations("isles");
  const [source, setSource] = useState("modrinth");
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("");
  const [version, setVersion] = useState("");
  const [results, setResults] = useState<CatalogProject[] | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  const filters = (chosen: string) => {
    const q = new URLSearchParams({ limit: "20" });
    if (platform && chosen === source) q.set(chosen === "hangar" ? "platform" : "loader", platform);
    if (version) q.set("game_version", version);
    return q;
  };
  const run = async (path: string, done: (data: unknown) => void) => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setError("");
    try {
      const data = await islesRequest(path, { signal: controller.signal });
      if (!controller.signal.aborted) done(data);
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : t("unavailable"));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b pb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold">{t("catalogTitle")}</h1>
            <p className="text-text-muted mt-3 max-w-2xl text-sm leading-relaxed">
              {t("catalogIntro")}
            </p>
          </div>
          <Link href="/servers" className="text-primary text-sm hover:underline">
            {t("back")}
          </Link>
        </div>
        <form
          className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[140px_minmax(0,1fr)_170px_140px_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            const q = filters(source);
            q.set("q", query);
            setSelection(null);
            void run(`catalog/${source}/search?${q}`, (data) =>
              setResults(data as CatalogProject[]),
            );
          }}
        >
          <div className="grid gap-2 text-sm">
            <label htmlFor="catalog-source">{t("catalogSource")}</label>
            <select
              id="catalog-source"
              className={control}
              value={source}
              onChange={(e) => {
                active.current?.abort();
                setBusy(false);
                setSource(e.target.value);
                setPlatform("");
                setResults(null);
                setSelection(null);
                setError("");
              }}
            >
              <option value="modrinth">Modrinth</option>
              <option value="hangar">Hangar</option>
            </select>
          </div>
          <label className="grid gap-2 text-sm">
            {t("catalogQuery")}
            <Input
              required
              maxLength={120}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={source === "hangar" ? "ViaVersion" : "Fabric API"}
            />
          </label>
          <div className="grid gap-2 text-sm">
            <label htmlFor="catalog-platform">{t("catalogPlatform")}</label>
            <select
              id="catalog-platform"
              className={control}
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="">{t("catalogAll")}</option>
              {(source === "hangar"
                ? ["PAPER", "VELOCITY", "WATERFALL"]
                : ["fabric", "neoforge", "forge", "quilt", "paper", "velocity"]
              ).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <label className="grid gap-2 text-sm">
            {t("catalogGameVersion")}
            <Input
              maxLength={32}
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.21.1"
            />
          </label>
          <Button type="submit" disabled={busy || !query.trim()}>
            {t(busy ? "working" : "catalogSearch")}
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-danger mt-6 text-sm break-words">
            {error}
          </p>
        )}
        {selection ? (
          <section className="mt-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">{selection.project.title}</h2>
                <a
                  href={selection.project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  {t("catalogOriginal")}
                </a>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  active.current?.abort();
                  setBusy(false);
                  setSelection(null);
                }}
              >
                {t("catalogBack")}
              </Button>
            </div>
            <p className="text-text-muted text-sm">{t("catalogDeclarations")}</p>
            {selection.versions.length === 0 ? (
              <p className="text-text-muted">{t("catalogNoVersions")}</p>
            ) : (
              selection.versions.map((release) => (
                <article key={release.id} className="space-y-4 rounded-lg border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{release.name}</h3>
                      <p className="text-text-muted mt-1 text-xs">
                        {release.loaders.join(", ")} / {release.channel}
                      </p>
                    </div>
                    <span className="text-text-muted text-xs">{release.number}</span>
                  </div>
                  <details className="text-sm">
                    <summary className="cursor-pointer">{t("catalogCompatibility")}</summary>
                    <p className="text-text-muted mt-2 break-words">
                      {release.gameVersions.join(", ")}
                    </p>
                  </details>
                  {release.files.length === 0 ? (
                    <p className="text-text-muted text-sm">{t("catalogNoFiles")}</p>
                  ) : (
                    <ul className="divide-y">
                      {release.files.map((file, index) => (
                        <li key={`${file.url}-${index}`} className="py-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm break-all">{file.name}</p>
                              <p className="text-text-muted text-xs">
                                {file.platform ? `${file.platform} / ` : ""}
                                {(file.size / 1024 / 1024).toFixed(2)} MiB
                              </p>
                            </div>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-sm underline"
                            >
                              {t("catalogDownload")}
                            </a>
                          </div>
                          <details className="mt-2 text-xs">
                            <summary className="text-text-muted cursor-pointer">
                              {t("catalogHashes")}
                            </summary>
                            <dl className="mt-2 space-y-2">
                              {Object.entries(file.hashes).map(([algorithm, value]) => (
                                <div key={algorithm}>
                                  <dt>{algorithm}</dt>
                                  <dd className="text-text-muted font-mono break-all">{value}</dd>
                                </div>
                              ))}
                            </dl>
                          </details>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))
            )}
          </section>
        ) : (
          results && (
            <section className="mt-10">
              <p className="text-text-muted mb-5 text-sm">
                {t("catalogResultCount", { count: results.length })}
              </p>
              {results.length === 0 ? (
                <p className="text-text-muted">{t("catalogNoResults")}</p>
              ) : (
                <div className="divide-y border-y">
                  {results.map((project) => (
                    <article
                      key={`${project.source}/${project.id}`}
                      className="grid gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_auto]"
                    >
                      <div>
                        <h2 className="font-display text-xl font-semibold">{project.title}</h2>
                        <p className="text-text-muted mt-2 max-w-3xl text-sm leading-relaxed">
                          {project.description}
                        </p>
                        <p className="text-text-muted mt-3 text-xs">
                          {project.source}
                          {project.loaders?.length ? ` / ${project.loaders.join(", ")}` : ""}
                        </p>
                      </div>
                      <div className="flex items-start gap-4">
                        <Button
                          variant="outline"
                          disabled={busy}
                          onClick={() => {
                            const q = filters(project.source);
                            const id = project.id.split("/").map(encodeURIComponent).join("/");
                            void run(`catalog/${project.source}/versions/${id}?${q}`, (data) =>
                              setSelection({ project, versions: data as CatalogVersion[] }),
                            );
                          }}
                        >
                          {t("catalogVersions")}
                        </Button>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary py-2 text-sm hover:underline"
                        >
                          {t("catalogOriginal")}
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )
        )}
      </main>
    </>
  );
}
