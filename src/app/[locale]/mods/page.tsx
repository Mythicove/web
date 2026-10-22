"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { hoardClient, type HoardProject } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

export default function ModsPage() {
  const t = useTranslations("mods");
  const [mods, setMods] = useState<HoardProject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    hoardClient
      .listMods()
      .then(setMods)
      .catch((e) => setError(String(e)));
  };
  useEffect(load, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const adminToken = (fd.get("adminToken") as string) ?? "";
    fd.delete("adminToken");
    setUploading(true);
    try {
      await hoardClient.uploadMod(fd, adminToken);
      setError(null);
      load();
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>

          <form
            onSubmit={submit}
            className="mt-6 grid max-w-2xl gap-3 rounded-lg border border-border bg-surface p-5"
          >
            <div className="grid gap-1.5">
              <Label>{t("uploadTitle")}</Label>
              <Input name="title" required placeholder="My Mod" />
            </div>
            <div className="grid gap-1.5">
              <Label>{t("version")}</Label>
              <Input name="version_number" required placeholder="1.0.0" />
            </div>
            <div className="grid gap-1.5">
              <Label>{t("adminToken")}</Label>
              <Input name="adminToken" placeholder="HOARD_ADMIN_TOKEN" />
            </div>
            <div className="grid gap-1.5">
              <Label>{t("file")}</Label>
              <Input name="file" type="file" required />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" disabled={uploading}>
              {t("upload")}
            </Button>
          </form>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {mods.map((m) => (
              <Card key={m.id} className="bg-surface">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-medium">{m.title}</span>
                    <Badge variant="secondary">{m.project_type}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-text-muted">{m.description}</p>
                  <div className="mt-4 text-xs">
                    <a className="text-highlight hover:underline" href={hoardClient.downloadUrl(m.id)}>
                      {t("download")}
                    </a>
                    <span className="ml-3 text-text-muted">{m.downloads} ↓</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {mods.length === 0 && !error && (
            <p className="mt-8 text-sm text-text-muted">{t("empty")}</p>
          )}
        </div>
      </main>
    </div>
  );
}
