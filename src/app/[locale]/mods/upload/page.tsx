"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { hoardClient, ApiError } from "@/lib/api";
import { useHoardUser } from "@/lib/hoard-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";

const splitList = (v: string) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export default function ModUploadPage() {
  const t = useTranslations("modUpload");
  const router = useRouter();
  const { user, loaded } = useHoardUser();
  const [form, setForm] = useState({
    title: "",
    description: "",
    body: "",
    project_type: "mod",
    client_side: "optional",
    server_side: "optional",
    loaders: "",
    game_versions: "",
    categories: "",
    version_number: "",
    version_name: "",
    changelog: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (!file || !form.title) {
      toast.error(t("needTitleFile"));
      return;
    }
    setBusy(true);
    try {
      const proj = await hoardClient.createProject(
        {
          ...form,
          loaders: splitList(form.loaders),
          game_versions: splitList(form.game_versions),
          categories: splitList(form.categories),
        },
        file,
      );
      toast.success(t("created"));
      router.push(`/mods/${proj.id}`);
    } catch (e) {
      toast.error(e instanceof ApiError ? `${e.status}: ${e.message}` : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>
          {loaded && !user ? (
            <div className="mt-6">
              <p className="text-sm text-text-muted">{t("needLogin")}</p>
              <a href={hoardClient.loginUrl()}>
                <Button className="mt-3">{t("ssoLogin")}</Button>
              </a>
            </div>
          ) : (
            <div className="mt-6 grid gap-3">
              <div className="grid gap-1.5">
                <Label>{t("modTitle")}</Label>
                <Input value={form.title} onChange={set("title")} required />
              </div>
              <div className="grid gap-1.5">
                <Label>{t("summary")}</Label>
                <Input value={form.description} onChange={set("description")} />
              </div>
              <div className="grid gap-1.5 md:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label>{t("loaders")}</Label>
                  <Input value={form.loaders} onChange={set("loaders")} placeholder="fabric,forge" />
                </div>
                <div className="grid gap-1.5">
                  <Label>{t("gameVersions")}</Label>
                  <Input
                    value={form.game_versions}
                    onChange={set("game_versions")}
                    placeholder="1.20.1"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>{t("categories")}</Label>
                  <Input value={form.categories} onChange={set("categories")} />
                </div>
              </div>
              <div className="grid gap-1.5 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>{t("versionNumber")}</Label>
                  <Input value={form.version_number} onChange={set("version_number")} placeholder="1.0.0" />
                </div>
                <div className="grid gap-1.5">
                  <Label>{t("versionNameOpt")}</Label>
                  <Input value={form.version_name} onChange={set("version_name")} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>{t("file")}</Label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
                <p className="text-xs text-text-muted">{t("fileHint")}</p>
              </div>
              <Button onClick={submit} disabled={busy}>
                {t("create")}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
