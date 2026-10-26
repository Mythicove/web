"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { hoardClient, type UploadProgress } from "@/lib/api";
import { useHoardUser } from "@/lib/hoard-auth";
import { useErrorText } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { FileField } from "@/components/file-field";
import { Skeleton } from "@/components/skeleton";
import { useRouter } from "@/i18n/navigation";

const MAX_MOD_BYTES = 512 * 1024 * 1024;

const splitList = (v: string) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export function ModUploadPageClient() {
  const t = useTranslations("modUpload");
  const tc = useTranslations("common");
  const errText = useErrorText();
  const router = useRouter();
  const { user, loaded } = useHoardUser();
  const [form, setForm] = useState({
    title: "",
    description: "",
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
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !file || !form.title) {
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
        setProgress,
      );
      toast.success(t("created"));
      router.push(`/mods/${proj.id}`);
    } catch (err) {
      toast.error(errText(err));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <h1 className="font-display text-2xl font-semibold">{t("title")}</h1>
          {!loaded ? (
            <div className="mt-6 grid gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !user ? (
            <div className="mt-6">
              <p className="text-text-muted text-sm">{t("needLogin")}</p>
            </div>
          ) : (
            <form onSubmit={(e) => void submit(e)} className="mt-6 grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="title">{t("modTitle")}</Label>
                <Input id="title" value={form.title} onChange={set("title")} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="description">{t("summary")}</Label>
                <Input id="description" value={form.description} onChange={set("description")} />
              </div>
              <div className="grid gap-1.5 md:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="loaders">{t("loaders")}</Label>
                  <Input
                    id="loaders"
                    value={form.loaders}
                    onChange={set("loaders")}
                    placeholder="fabric,forge"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="game_versions">{t("gameVersions")}</Label>
                  <Input
                    id="game_versions"
                    value={form.game_versions}
                    onChange={set("game_versions")}
                    placeholder="1.20.1"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="categories">{t("categories")}</Label>
                  <Input id="categories" value={form.categories} onChange={set("categories")} />
                </div>
              </div>
              <div className="grid gap-1.5 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="version_number">{t("versionNumber")}</Label>
                  <Input
                    id="version_number"
                    value={form.version_number}
                    onChange={set("version_number")}
                    placeholder="1.0.0"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="version_name">{t("versionNameOpt")}</Label>
                  <Input
                    id="version_name"
                    value={form.version_name}
                    onChange={set("version_name")}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="mod-file">{t("file")}</Label>
                <FileField
                  id="mod-file"
                  value={file}
                  onChange={setFile}
                  accept=".jar,.mrpack,.zip"
                  maxBytes={MAX_MOD_BYTES}
                />
                <p className="text-text-muted text-xs">{t("fileHint")}</p>
              </div>
              {progress && (
                <p className="text-text-muted text-xs">
                  {tc("uploading", {
                    percent: Math.round((progress.loaded / progress.total) * 100),
                  })}
                </p>
              )}
              <div>
                <Button type="submit" disabled={busy}>
                  {busy ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
                  {t("create")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
