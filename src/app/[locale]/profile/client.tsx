"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  InfoIcon,
  Link2Icon,
  Loader2Icon,
  PencilIcon,
  Trash2Icon,
  UnlinkIcon,
  UploadIcon,
  UserPlusIcon,
} from "lucide-react";
import { apiClient, type Player, type UploadProgress } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useErrorText } from "@/lib/errors";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import { SkinPreview } from "@/components/skin-preview";
import { FileField } from "@/components/file-field";
import { PlayerAvatar } from "@/components/player-avatar";
import { ConfirmDialog } from "@/components/confirm-dialog";

const MAX_SKIN_BYTES = 2 * 1024 * 1024;

function ProgressLine({ p }: { p: UploadProgress | null }) {
  const t = useTranslations("common");
  if (!p) return null;
  const percent = Math.round((p.loaded / p.total) * 100);
  return (
    <div className="grid gap-1">
      <div className="bg-surface-raised h-1.5 overflow-hidden rounded-full">
        <div className="bg-primary h-full transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-text-muted text-xs">{t("uploading", { percent })}</p>
    </div>
  );
}

export function ProfilePageClient() {
  return (
    <Suspense>
      <ProfileInner />
    </Suspense>
  );
}

function ProfileInner() {
  const t = useTranslations("profile");
  const errText = useErrorText();
  const params = useSearchParams();
  const bind = params.get("bind");
  const { auth, isAuthenticated } = useAuth();
  // auth 从 localStorage 异步恢复，玩家名以 auth 为准，用户可覆盖。
  const [playerNameOverride, setPlayerNameOverride] = useState<string | null>(null);
  const playerName = playerNameOverride ?? auth?.playerName ?? "";
  const [model, setModel] = useState("default");
  const [skinFile, setSkinFile] = useState<File | null>(null);
  const [capeFile, setCapeFile] = useState<File | null>(null);
  const [publishDesc, setPublishDesc] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"" | "skin" | "cape" | "publish">("");
  const [skinProgress, setSkinProgress] = useState<UploadProgress | null>(null);
  const [capeProgress, setCapeProgress] = useState<UploadProgress | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  // 玩家管理（改名/删除/设为当前）独立的忙碌态，避免与上传/发布的 busy 联合体互相干扰
  const [playerBusy, setPlayerBusy] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const reloadPlayers = useCallback(() => {
    apiClient
      .listPlayers()
      .then(setPlayers)
      .catch(() => setPlayers([]));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    reloadPlayers();
  }, [isAuthenticated, reloadPlayers]);

  const addPlayer = async () => {
    if (busy || !newPlayer.trim()) return;
    setBusy("publish");
    setError(null);
    try {
      await apiClient.addPlayer(newPlayer.trim());
      setNewPlayer("");
      setStatus(t("playerAdded"));
      reloadPlayers();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy("");
    }
  };

  // 改名会更换 uuid 并使该玩家的游戏会话失效，故确认后才提交
  const renamePlayer = async (oldName: string) => {
    const next = renameValue.trim();
    if (!next || next === oldName || playerBusy) return;
    setPlayerBusy(`rename-${oldName}`);
    setError(null);
    try {
      await apiClient.renamePlayer(oldName, next);
      setRenaming(null);
      setRenameValue("");
      setStatus(t("playerRenamed"));
      reloadPlayers();
    } catch (e) {
      setError(errText(e));
    } finally {
      setPlayerBusy(null);
    }
  };

  const deletePlayer = async (name: string) => {
    if (playerBusy) return;
    setPlayerBusy(`delete-${name}`);
    setError(null);
    try {
      await apiClient.deletePlayer(name);
      setStatus(t("playerDeleted"));
      reloadPlayers();
    } catch (e) {
      setError(errText(e));
    } finally {
      setPlayerBusy(null);
      setPendingDelete(null);
    }
  };

  const activatePlayer = async (name: string) => {
    if (playerBusy) return;
    setPlayerBusy(`activate-${name}`);
    setError(null);
    try {
      await apiClient.activatePlayer(name);
      setStatus(t("playerActivated"));
      reloadPlayers();
    } catch (e) {
      setError(errText(e));
    } finally {
      setPlayerBusy(null);
    }
  };

  const unbindPremium = async (name: string) => {
    if (!name || playerBusy) return;
    setPlayerBusy(`unbind-${name}`);
    setError(null);
    try {
      await apiClient.unbindPremium(name);
      setStatus(t("premiumUnbound"));
      reloadPlayers();
    } catch (e) {
      setError(errText(e));
    } finally {
      setPlayerBusy(null);
    }
  };

  // 选中本地文件时优先预览本地文件，上传前即可确认效果。
  // object URL 在选择时创建、被替换或卸载时回收，不放进 effect 以避免级联渲染。
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);
  const takeSkinFile = (f: File | null) => {
    setSkinFile(f);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = f ? URL.createObjectURL(f) : null;
    setLocalPreview(previewRef.current);
  };
  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  const publish = async () => {
    if (busy) return;
    if (!isAuthenticated) return setError(t("notLoggedIn"));
    setBusy("publish");
    setError(null);
    setStatus(null);
    try {
      await apiClient.publishSkin(playerName, publishDesc);
      setStatus(t("publishOk"));
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy("");
    }
  };

  const uploadSkin = async () => {
    if (busy) return;
    if (!isAuthenticated) return setError(t("notLoggedIn"));
    if (!skinFile) return setError(t("noFile"));
    setBusy("skin");
    setError(null);
    setStatus(null);
    try {
      await apiClient.uploadSkin(playerName, model, skinFile, setSkinProgress);
      setStatus(t("uploadOk"));
      setSkinFile(null);
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy("");
      setSkinProgress(null);
    }
  };

  const uploadCape = async () => {
    if (busy) return;
    if (!isAuthenticated) return setError(t("notLoggedIn"));
    if (!capeFile) return setError(t("noFile"));
    setBusy("cape");
    setError(null);
    setStatus(null);
    try {
      await apiClient.uploadCape(playerName, capeFile, setCapeProgress);
      setStatus(t("uploadOk"));
      setCapeFile(null);
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy("");
      setCapeProgress(null);
    }
  };

  const previewUrl =
    localPreview ?? (playerName ? apiClient.skinUrl(playerName) : "/skins/steve.png");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 justify-center px-6 py-16">
        <div className="grid w-full max-w-4xl items-start gap-8 lg:grid-cols-2">
          <Card className="bg-surface shadow-card">
            <CardHeader>
              <CardTitle className="font-display">{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAuthenticated && (
                <p className="text-text-muted flex items-center gap-1.5 text-sm">
                  <InfoIcon className="size-4" />
                  {t("notLoggedIn")}
                </p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="playerName">{t("playerName")}</Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerNameOverride(e.target.value)}
                  placeholder="Steve"
                  maxLength={16}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model">{t("model")}</Label>
                <Select name="model" value={model} onValueChange={(v) => setModel(String(v))}>
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Steve (default)</SelectItem>
                    <SelectItem value="slim">Alex (slim)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="skin-file">{t("file")}</Label>
                <FileField
                  id="skin-file"
                  value={skinFile}
                  onChange={takeSkinFile}
                  accept="image/png"
                  maxBytes={MAX_SKIN_BYTES}
                />
              </div>
              <ProgressLine p={skinProgress} />
              <Button
                className="w-full"
                disabled={busy !== "" || !isAuthenticated}
                onClick={() => void uploadSkin()}
              >
                {busy === "skin" ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
                {t("upload")}
              </Button>

              <div className="space-y-1.5">
                <Label htmlFor="cape-file">{t("cape")}</Label>
                <FileField
                  id="cape-file"
                  value={capeFile}
                  onChange={setCapeFile}
                  accept="image/png"
                  maxBytes={MAX_SKIN_BYTES}
                />
              </div>
              <ProgressLine p={capeProgress} />
              <Button
                variant="outline"
                className="w-full"
                disabled={busy !== "" || !isAuthenticated}
                onClick={() => void uploadCape()}
              >
                {busy === "cape" && <Loader2Icon className="animate-spin" />}
                {t("uploadCape")}
              </Button>

              <div className="border-border space-y-1.5 border-t pt-4">
                <Label htmlFor="publishDesc">{t("publishDesc")}</Label>
                <Input
                  id="publishDesc"
                  value={publishDesc}
                  onChange={(e) => setPublishDesc(e.target.value)}
                  placeholder={t("publishDescPlaceholder")}
                  maxLength={200}
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                disabled={busy !== "" || !isAuthenticated}
                onClick={() => void publish()}
              >
                {busy === "publish" && <Loader2Icon className="animate-spin" />}
                {t("publish")}
              </Button>

              {error && (
                <p role="alert" className="text-danger text-sm">
                  {error}
                </p>
              )}
              {status && (
                <p role="status" className="text-success text-sm">
                  {status}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-surface shadow-card h-fit">
            <CardHeader>
              <CardTitle className="font-display">{t("preview")}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SkinPreview skinUrl={previewUrl} />
            </CardContent>
          </Card>
        </div>

        <div className="mx-auto mt-8 grid w-full max-w-4xl gap-8 lg:grid-cols-2">
          <Card className="bg-surface shadow-card h-fit">
            <CardHeader>
              <CardTitle className="font-display">{t("playersTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {players.map((p, i) => {
                const label = p.name ?? p.id ?? String(i);
                const isRenaming = renaming === label;
                return (
                  <div
                    key={p.id ?? i}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    {isRenaming ? (
                      <span className="flex items-center gap-2">
                        <Input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          maxLength={16}
                          aria-label={t("renamePlayer")}
                          className="h-8 w-40"
                        />
                        <Button
                          size="sm"
                          disabled={playerBusy !== null || !renameValue.trim()}
                          onClick={() => void renamePlayer(label)}
                        >
                          {playerBusy === `rename-${label}` && (
                            <Loader2Icon className="animate-spin" />
                          )}
                          {t("saveRename")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setRenaming(null);
                            setRenameValue("");
                          }}
                        >
                          {t("cancelRename")}
                        </Button>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-sm">
                        <PlayerAvatar name={label} size={28} />
                        {label}
                        {p.active && <Badge variant="secondary">{t("currentPlayer")}</Badge>}
                        {p.premium && <Badge variant="outline">{t("premiumBadge")}</Badge>}
                      </span>
                    )}
                    {!isRenaming && (
                      <span className="flex items-center gap-1.5">
                        {!p.active && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={playerBusy !== null}
                            onClick={() => void activatePlayer(label)}
                          >
                            {t("setActive")}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          // 已绑定正版的玩家名字来自 Mojang，后端拒绝改名（409）；这里直接禁用并提示
                          disabled={playerBusy !== null || p.premium === true}
                          title={p.premium ? t("renamePremiumBlocked") : undefined}
                          onClick={() => {
                            setRenaming(label);
                            setRenameValue(label);
                          }}
                        >
                          <PencilIcon />
                          {t("renamePlayer")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          // 后端拒绝删除唯一玩家（409）；这里同时禁用按钮，避免必然失败的操作
                          disabled={playerBusy !== null || players.length <= 1}
                          onClick={() => setPendingDelete(label)}
                        >
                          <Trash2Icon />
                          {t("deletePlayer")}
                        </Button>
                      </span>
                    )}
                  </div>
                );
              })}
              <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => {
                  if (!open) setPendingDelete(null);
                }}
                title={t("deletePlayerTitle")}
                description={t("deletePlayerHint", { name: pendingDelete ?? "" })}
                confirmLabel={t("deletePlayer")}
                busy={playerBusy !== null}
                onConfirm={() => {
                  if (pendingDelete) void deletePlayer(pendingDelete);
                }}
              />
              {isAuthenticated && players.length === 0 && (
                <p className="text-text-muted text-sm">{t("noPlayers")}</p>
              )}
              <div className="border-border flex gap-2 border-t pt-3">
                <Input
                  value={newPlayer}
                  onChange={(e) => setNewPlayer(e.target.value)}
                  placeholder="Steve"
                  maxLength={16}
                  aria-label={t("addPlayer")}
                />
                <Button
                  variant="outline"
                  disabled={busy !== "" || !isAuthenticated || !newPlayer.trim()}
                  onClick={() => void addPlayer()}
                >
                  <UserPlusIcon />
                  {t("addPlayer")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface shadow-card h-fit">
            <CardHeader>
              <CardTitle className="font-display">{t("premiumTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-text-muted text-sm">{t("premiumHint")}</p>
              {bind === "ok" && (
                <p role="status" className="text-success text-sm">
                  {t("bindOk")}
                </p>
              )}
              {bind === "error" && (
                <p role="alert" className="text-danger text-sm">
                  {t("bindError")}
                </p>
              )}
              <Button
                variant="outline"
                disabled={!isAuthenticated}
                onClick={() => window.location.assign(apiClient.mojangBindUrl())}
              >
                <Link2Icon />
                {t("bindMicrosoft")}
              </Button>
              {players.some((p) => p.premium) && (
                <div className="border-border space-y-2 border-t pt-3">
                  <p className="text-text-muted text-xs">{t("premiumBoundHint")}</p>
                  {players
                    .filter((p) => p.premium)
                    .map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2">
                          <PlayerAvatar name={p.name ?? ""} size={24} />
                          {p.name}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={playerBusy !== null}
                          onClick={() => void unbindPremium(p.name ?? "")}
                        >
                          {playerBusy === `unbind-${p.name}` && (
                            <Loader2Icon className="animate-spin" />
                          )}
                          <UnlinkIcon />
                          {t("unbind")}
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
