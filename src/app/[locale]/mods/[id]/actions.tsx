"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";
import { hoardClient, ApiError, type UploadProgress } from "@/lib/api";
import { useHoardUser } from "@/lib/hoard-auth";
import { useErrorText } from "@/lib/errors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FileField } from "@/components/file-field";

const MAX_MOD_BYTES = 512 * 1024 * 1024;

// 详情页的登录态操作岛：发版（团队成员）与删除（admin）。公开内容仍由 RSC 渲染。
export function ModActions({ projectId }: { projectId: string }) {
  const t = useTranslations("modDetail");
  const errText = useErrorText();
  const router = useRouter();
  const { user, loaded } = useHoardUser();

  const [form, setForm] = useState({ version_number: "", name: "", changelog: "" });
  const [versionType, setVersionType] = useState("release");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!loaded || !user) return null;

  const publishVersion = async (e: FormEvent) => {
    e.preventDefault();
    if (publishing || !file || !form.version_number) return;
    setPublishing(true);
    try {
      await hoardClient.addVersion(
        {
          project_id: projectId,
          name: form.name || form.version_number,
          version_number: form.version_number,
          version_type: versionType,
          changelog: form.changelog,
        },
        file,
        setProgress,
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError && err.status === 403 ? t("notMember") : errText(err));
    } finally {
      setPublishing(false);
      setProgress(null);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await hoardClient.deleteProject(projectId);
      router.push("/mods");
    } catch (err) {
      setDeleting(false);
      toast.error(errText(err));
    }
  };

  return (
    <section className="border-border bg-surface shadow-card mt-8 rounded-xl border p-5">
      <h2 className="font-display text-lg font-semibold">{t("publishVersion")}</h2>
      <p className="text-text-muted mt-1 text-xs">{t("publishHint")}</p>
      <form
        onSubmit={(e) => void publishVersion(e)}
        className="mt-4 grid max-w-xl gap-3 md:grid-cols-2"
      >
        <div className="grid gap-1.5">
          <Label htmlFor="version_number">{t("versionNumber")}</Label>
          <Input
            id="version_number"
            value={form.version_number}
            onChange={(e) => setForm({ ...form, version_number: e.target.value })}
            placeholder="1.1.0"
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="version-name">{t("versionNameOpt")}</Label>
          <Input
            id="version-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="version-type">{t("versionType")}</Label>
          <Select
            name="version_type"
            value={versionType}
            onValueChange={(v) => setVersionType(String(v))}
          >
            <SelectTrigger id="version-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="release">release</SelectItem>
              <SelectItem value="beta">beta</SelectItem>
              <SelectItem value="alpha">alpha</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5 md:col-span-2">
          <Label htmlFor="changelog">{t("changelogOpt")}</Label>
          <Input
            id="changelog"
            value={form.changelog}
            onChange={(e) => setForm({ ...form, changelog: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5 md:col-span-2">
          <Label htmlFor="version-file">{t("file")}</Label>
          <FileField
            id="version-file"
            value={file}
            onChange={setFile}
            accept=".jar,.mrpack,.zip"
            maxBytes={MAX_MOD_BYTES}
          />
        </div>
        {progress && (
          <p className="text-text-muted text-xs md:col-span-2">
            {Math.round((progress.loaded / progress.total) * 100)}%
          </p>
        )}
        <div className="md:col-span-2">
          <Button type="submit" disabled={publishing || !file}>
            {publishing ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
            {t("publish")}
          </Button>
        </div>
      </form>

      {user.role === "admin" && (
        <div className="border-border mt-6 border-t pt-4">
          <Button variant="destructive" onClick={() => setConfirmDelete(true)} disabled={deleting}>
            <Trash2Icon />
            {t("deleteProject")}
          </Button>
        </div>
      )}
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t("deleteProject")}
        busy={deleting}
        onConfirm={() => void remove()}
      />
    </section>
  );
}

export function ModMetaBadges({
  loaders,
  gameVersions,
}: {
  loaders: string[];
  gameVersions: string[];
}) {
  if (loaders.length === 0 && gameVersions.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {loaders.map((l) => (
        <Badge key={l} variant="outline">
          {l}
        </Badge>
      ))}
      {gameVersions.map((v) => (
        <Badge key={v} variant="outline">
          {v}
        </Badge>
      ))}
    </div>
  );
}
