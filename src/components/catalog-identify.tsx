"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { components } from "@/lib/api-schema/isles";

type Identification = {
  name: string;
  hash: string;
  match: components["schemas"]["CatalogMatch"] | null;
};

export function CatalogIdentify() {
  const t = useTranslations("isles");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Identification | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  async function identify() {
    if (!file) return;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setBusy(true);
    setResult(null);
    setError("");
    try {
      if (file.size > 128 * 1024 * 1024) throw new Error(t("identifyTooLarge"));
      if (!globalThis.crypto?.subtle) throw new Error(t("identifySecureContext"));
      const digest = await crypto.subtle.digest("SHA-512", await file.arrayBuffer());
      if (controller.signal.aborted) return;
      const hash = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
      const response = await fetch(`/api/isles/catalog/modrinth/hash/${hash}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok && response.status !== 404)
        throw new Error(`${response.status}: ${(await response.text()).slice(0, 240)}`);
      const match = response.status === 404 ? null : await response.json();
      if (!controller.signal.aborted) setResult({ name: file.name, hash, match });
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(cause instanceof Error ? cause.message : t("unavailable"));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return (
    <section className="mb-8 space-y-4 rounded-lg border p-5" aria-labelledby="identify-title">
      <h2 id="identify-title" className="font-display text-xl font-semibold">
        {t("identifyTitle")}
      </h2>
      <p className="text-text-muted text-sm">{t("identifyIntro")}</p>
      <form
        className="flex flex-wrap items-end gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void identify();
        }}
      >
        <label className="grid min-w-0 flex-1 gap-2 text-sm">
          {t("identifyFile")}
          <Input
            type="file"
            onChange={(event) => {
              active.current?.abort();
              setBusy(false);
              setResult(null);
              setError("");
              setFile(event.target.files?.[0] ?? null);
            }}
          />
        </label>
        <Button type="submit" disabled={!file || busy}>
          {t(busy ? "working" : "identifyAction")}
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-danger text-sm break-words">
          {error}
        </p>
      )}
      {result && (
        <div role="status" className="space-y-3 border-t pt-4 text-sm">
          <p className="font-semibold break-all">{result.name}</p>
          <p>{t(result.match ? "identifyMatched" : "identifyNotFound")}</p>
          <details>
            <summary className="cursor-pointer">{t("identifyDigest")}</summary>
            <p className="mt-2 font-mono text-xs break-all">{result.hash}</p>
          </details>
          {result.match && (
            <>
              <h3 className="font-semibold">{result.match.version.name}</h3>
              <p>
                {result.match.version.number} / {result.match.version.channel}
              </p>
              <p className="break-words">
                {result.match.version.loaders.join(", ")} /{" "}
                {result.match.version.gameVersions.join(", ")}
              </p>
              <a
                className="text-primary underline"
                href={`https://modrinth.com/project/${encodeURIComponent(result.match.projectId)}/version/${encodeURIComponent(result.match.version.id)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("catalogOriginal")}
              </a>
              <ul className="space-y-2">
                {result.match.version.files.map((matched, index) => (
                  <li key={index} className="break-all">
                    {t("identifyPublisherFile")}: {matched.name}
                  </li>
                ))}
              </ul>
              <p className="text-text-muted text-xs">{t("identifyHint")}</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
