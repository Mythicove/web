"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  InfoIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  Link2Icon,
  Loader2Icon,
  PencilIcon,
  ShieldIcon,
  ShirtIcon,
  Trash2Icon,
  UnlinkIcon,
  UploadIcon,
  UserPlusIcon,
} from "lucide-react";
import {
  apiClient,
  type AccountMe,
  type BindingState,
  type LoginMethod,
  type Player,
  type PlayerCredential,
  type RegisterRequirements,
  type UploadProgress,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useErrorText } from "@/lib/errors";
import { PasswordChecklist } from "@/components/password-checklist";
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
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

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

export type UserSection = "overview" | "skin" | "security" | "bindings";

export function ProfilePageClient({ section }: { section: UserSection }) {
  return (
    <Suspense>
      <ProfileInner section={section} />
    </Suspense>
  );
}

function ProfileInner({ section }: { section: UserSection }) {
  const t = useTranslations("profile");
  const errText = useErrorText();
  const params = useSearchParams();
  const bind = params.get("bind");
  const { auth, isAuthenticated, selectPlayer } = useAuth();
  // 玩哪个玩家是浏览器本地的选择（ADR-0012 删除了服务端"当前玩家"）：
  // auth.playerName 由 AuthProvider 在登录后从玩家列表补齐，这里只做展示与切换。
  const playerName = auth?.playerName ?? "";
  const [model, setModel] = useState("default");
  const [presets, setPresets] = useState<string[]>([]);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [skinFile, setSkinFile] = useState<File | null>(null);
  const [capeFile, setCapeFile] = useState<File | null>(null);
  const [publishDesc, setPublishDesc] = useState("");
  const [busy, setBusy] = useState<"" | "skin" | "cape" | "publish">("");
  const [skinProgress, setSkinProgress] = useState<UploadProgress | null>(null);
  const [capeProgress, setCapeProgress] = useState<UploadProgress | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayer, setNewPlayer] = useState("");
  // 玩家管理（改名/删除）独立的忙碌态，避免与上传/发布的 busy 联合体互相干扰
  const [playerBusy, setPlayerBusy] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  // 启动器独立密码（ADR-0012）：启动器登录只认「玩家名 + 独立密码」，与网站主密码分开。
  // 列表与它所属的玩家一起存：切换玩家时旧列表立即不显示，而不是等新请求回来才替换。
  const [credState, setCredState] = useState<{ player: string; list: PlayerCredential[] }>({
    player: "",
    list: [],
  });
  const [credLabel, setCredLabel] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credBusy, setCredBusy] = useState(false);
  const [pendingCred, setPendingCred] = useState<string | null>(null);
  // 第三方绑定：站点强制绑定而账号尚未绑定时，皮肤/mods/启动器登录都会被拒
  const [binding, setBinding] = useState<BindingState | null>(null);
  const [oauthProviders, setOauthProviders] = useState<LoginMethod[]>([]);

  const reloadPlayers = useCallback(() => {
    apiClient
      .listPlayers()
      .then(setPlayers)
      .catch(() => setPlayers([]));
  }, []);

  const reloadCredentials = useCallback((name: string) => {
    if (!name) return;
    apiClient
      .listPlayerCredentials(name)
      .then((r) => setCredState({ player: name, list: r.credentials }))
      .catch(() => setCredState({ player: name, list: [] }));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    reloadPlayers();
    apiClient
      .identities()
      .then(setBinding)
      .catch(() => setBinding(null));
    apiClient
      .listLoginMethods()
      .then((r) => setOauthProviders(r.methods.filter((m) => m.enabled && m.type === "oauth")))
      .catch(() => setOauthProviders([]));
  }, [isAuthenticated, reloadPlayers]);

  useEffect(() => {
    if (!isAuthenticated || !playerName) return;
    reloadCredentials(playerName);
  }, [isAuthenticated, playerName, reloadCredentials]);

  // 只有与当前选中玩家匹配时才显示，切换玩家不会看到上一个玩家的列表
  const creds = credState.player === playerName ? credState.list : [];

  const addCredential = async () => {
    if (credBusy || !playerName || !credLabel.trim() || !credPassword) return;
    setCredBusy(true);
    
    try {
      await apiClient.createPlayerCredential(playerName, credLabel.trim(), credPassword);
      setCredLabel("");
      setCredPassword("");
      toast.success(t("credentialAdded"));
      reloadCredentials(playerName);
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setCredBusy(false);
    }
  };

  // 撤销后由该凭证建立的启动器会话立刻失效（不是等令牌自然过期）
  const deleteCredential = async (id: string) => {
    if (credBusy || !playerName) return;
    setCredBusy(true);
    
    try {
      await apiClient.deletePlayerCredential(playerName, id);
      toast.success(t("credentialRevoked"));
      reloadCredentials(playerName);
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setCredBusy(false);
      setPendingCred(null);
    }
  };

  const addPlayer = async () => {
    if (busy || !newPlayer.trim()) return;
    setBusy("publish");
    
    try {
      await apiClient.addPlayer(newPlayer.trim());
      setNewPlayer("");
      toast.success(t("playerAdded"));
      reloadPlayers();
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy("");
    }
  };

  // 改名会更换 uuid 并使该玩家的游戏会话失效，故确认后才提交
  const renamePlayer = async (oldName: string) => {
    const next = renameValue.trim();
    if (!next || next === oldName || playerBusy) return;
    setPlayerBusy(`rename-${oldName}`);
    
    try {
      await apiClient.renamePlayer(oldName, next);
      setRenaming(null);
      setRenameValue("");
      // 选中的玩家被改名后本地选择会指向不存在的名字，跟着改过来
      if (oldName === playerName) selectPlayer(next);
      toast.success(t("playerRenamed"));
      reloadPlayers();
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setPlayerBusy(null);
    }
  };

  const deletePlayer = async (name: string) => {
    if (playerBusy) return;
    setPlayerBusy(`delete-${name}`);
    
    try {
      await apiClient.deletePlayer(name);
      // 删掉的正是选中的玩家 → 本地选择退到剩下的第一个
      if (name === playerName) {
        selectPlayer(players.find((p) => p.name !== name)?.name ?? "");
      }
      toast.success(t("playerDeleted"));
      reloadPlayers();
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setPlayerBusy(null);
      setPendingDelete(null);
    }
  };

  const unbindPremium = async (name: string) => {
    if (!name || playerBusy) return;
    setPlayerBusy(`unbind-${name}`);
    
    try {
      await apiClient.unbindPremium(name);
      toast.success(t("premiumUnbound"));
      reloadPlayers();
    } catch (e) {
      toast.error(errText(e));
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
    if (!isAuthenticated) return toast.error(t("notLoggedIn"));
    setBusy("publish");
    
    
    try {
      await apiClient.publishSkin(playerName, publishDesc);
      toast.success(t("publishOk"));
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy("");
    }
  };

  const uploadSkin = async () => {
    if (busy) return;
    if (!isAuthenticated) return toast.error(t("notLoggedIn"));
    if (!skinFile) return toast.error(t("noFile"));
    setBusy("skin");
    
    
    try {
      await apiClient.uploadSkin(playerName, model, skinFile, setSkinProgress);
      toast.success(t("uploadOk"));
      setSkinFile(null);
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy("");
      setSkinProgress(null);
    }
  };

  const uploadCape = async () => {
    if (busy) return;
    if (!isAuthenticated) return toast.error(t("notLoggedIn"));
    if (!capeFile) return toast.error(t("noFile"));
    setBusy("cape");
    
    
    try {
      await apiClient.uploadCape(playerName, capeFile, setCapeProgress);
      toast.success(t("uploadOk"));
      setCapeFile(null);
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setBusy("");
      setCapeProgress(null);
    }
  };

  // 内置预设画廊（vanilla 默认皮肤）；失败不阻塞主流程
  useEffect(() => {
    apiClient
      .listSkinPresets()
      .then((r) => setPresets(r.ids))
      .catch(() => setPresets([]));
  }, []);

  // 切换体型立即生效（服务端换内置变体/改模型标记），预览随之刷新
  const applyModel = async (m: string) => {
    setModel(m);
    if (!isAuthenticated || !playerName) return;
    
    try {
      await apiClient.setPlayerModel(playerName, m);
      setLocalPreview(null);
      setPreviewNonce((n) => n + 1);
    } catch (err) {
      toast.error(errText(err));
    }
  };

  // 应用内置预设：把对应体型的 vanilla 皮肤设为该玩家的皮肤
  const applyPreset = async (id: string) => {
    if (!isAuthenticated || !playerName) return;
    setBusy("skin");
    
    
    try {
      await apiClient.applySkinPreset(playerName, id, model);
      toast.success(t("presetApplied"));
      setLocalPreview(null);
      setPreviewNonce((n) => n + 1);
    } catch (err) {
      toast.error(errText(err));
    } finally {
      setBusy("");
    }
  };

  // 清除自定义皮肤/披风 → 回落内置默认（Steve/Alex 按模型）；预览随之刷新
  const clearBuiltin = async (kind: "skin" | "cape") => {
    if (!playerName) return;
    setBusy(kind);
    
    
    try {
      if (kind === "skin") await apiClient.clearSkin(playerName);
      else await apiClient.clearCape(playerName);
      toast.success(t("clearOk"));
      setLocalPreview(null);
    } catch (err) {
      toast.error(errText(err));
    } finally {
      setBusy("");
    }
  };

  const previewBase =
    localPreview ?? (playerName ? apiClient.skinUrl(playerName) : "/skins/steve.png");
  // nonce 作查询串：清除/换预设/换体型后强制预览重新拉图（绕过浏览器缓存）
  const previewUrl = previewNonce > 0 ? `${previewBase}?v=${previewNonce}` : previewBase;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 py-10 md:px-6">
        <div className="mx-auto grid w-full max-w-6xl items-start gap-8 lg:grid-cols-[220px_1fr]">
          <UserNav section={section} />
          <div className="space-y-8">
            {section === "overview" && (
              <OverviewSection players={players} isAuthenticated={isAuthenticated} />
            )}
            {section === "skin" && (
              <div className="grid w-full items-start gap-8 lg:grid-cols-2">
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
                {/* 只能在自己已有的玩家里选（此前是可自由输入的文本框，填别人的名字只会 404） */}
                <Select
                  name="playerName"
                  value={playerName}
                  disabled={players.length === 0}
                  onValueChange={(v) => selectPlayer(String(v))}
                >
                  <SelectTrigger id="playerName">
                    <SelectValue placeholder={t("choosePlayer")} />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((p, i) => {
                      const label = p.name ?? p.id ?? String(i);
                      return (
                        <SelectItem key={p.id ?? i} value={label}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-text-muted text-xs">{t("playerNameHint")}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model">{t("model")}</Label>
                <Select name="model" value={model} onValueChange={(v) => void applyModel(String(v))}>
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Steve (default)</SelectItem>
                    <SelectItem value="slim">Alex (slim)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy !== "" || !isAuthenticated || !playerName}
                  onClick={() => void clearBuiltin("skin")}
                >
                  {t("clearSkin")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy !== "" || !isAuthenticated || !playerName}
                  onClick={() => void clearBuiltin("cape")}
                >
                  {t("clearCape")}
                </Button>
              </div>
              <p className="text-text-muted text-xs">{t("builtinHint")}</p>
              {presets.length > 0 && (
                <div className="space-y-1.5">
                  <Label>{t("presets")}</Label>
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
                    {presets.map((id) => (
                      <button
                        key={id}
                        type="button"
                        title={id}
                        aria-label={id}
                        disabled={busy !== "" || !isAuthenticated || !playerName}
                        onClick={() => void applyPreset(id)}
                        className="border-border bg-bg hover:border-primary disabled:opacity-50 overflow-hidden rounded-md border transition-colors"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- 预设缩略图来自后端渲染 */}
                        <img
                          src={apiClient.skinPresetRenderUrl(id, model, "body")}
                          alt={id}
                          loading="lazy"
                          decoding="async"
                          className="aspect-square w-full object-contain [image-rendering:pixelated]"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
            )}

            <div className="grid w-full gap-8 lg:grid-cols-2">
          {section === "skin" && (
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
                        {playerName === label && (
                          <Badge variant="secondary">{t("currentPlayer")}</Badge>
                        )}
                        {p.premium && <Badge variant="outline">{t("premiumBadge")}</Badge>}
                      </span>
                    )}
                    {!isRenaming && (
                      <span className="flex items-center gap-1.5">
                        {playerName !== label && (
                          <Button
                            size="sm"
                            variant="outline"
                            // 选中哪个玩家是浏览器本地的选择（服务端已无"当前玩家"）：
                            // 它决定页头头像与上传/应用皮肤的作用对象
                            onClick={() => selectPlayer(label)}
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
          )}

          {section === "bindings" && (
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
          )}

          {section === "security" && (
          <ChangePasswordCard />
          )}

          {section === "security" && (
          <Card className="bg-surface shadow-card h-fit">
            <CardHeader>
              <CardTitle className="font-display">{t("launcherTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-text-muted text-sm">{t("launcherHint")}</p>
              {!isAuthenticated ? (
                <p className="text-text-muted flex items-center gap-1.5 text-sm">
                  <InfoIcon className="size-4" />
                  {t("notLoggedIn")}
                </p>
              ) : (
                <>
                  <p className="text-sm">{t("launcherForPlayer", { player: playerName || "—" })}</p>
                  {creds.length === 0 && (
                    <p role="status" className="text-warning text-sm">
                      {t("noCredentials")}
                    </p>
                  )}
                  {creds.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0">
                        <span className="block truncate">{c.name}</span>
                        <span className="text-text-muted block text-xs">
                          {t("credentialMeta", {
                            created: new Date(c.created_at).toLocaleDateString(),
                            used: c.last_used_at
                              ? new Date(c.last_used_at).toLocaleDateString()
                              : t("neverUsed"),
                          })}
                        </span>
                      </span>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={credBusy}
                        onClick={() => setPendingCred(c.id)}
                      >
                        <Trash2Icon />
                        {t("revokeCredential")}
                      </Button>
                    </div>
                  ))}
                  <div className="border-border space-y-2 border-t pt-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="cred-name">{t("credentialName")}</Label>
                      <Input
                        id="cred-name"
                        value={credLabel}
                        maxLength={64}
                        placeholder={t("credentialNamePlaceholder")}
                        onChange={(e) => setCredLabel(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cred-password">{t("credentialPassword")}</Label>
                      <Input
                        id="cred-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        value={credPassword}
                        onChange={(e) => setCredPassword(e.target.value)}
                      />
                      <p className="text-text-muted text-xs">{t("credentialPasswordHint")}</p>
                    </div>
                    <Button
                      variant="outline"
                      disabled={
                        credBusy || !playerName || !credLabel.trim() || credPassword.length < 8
                      }
                      onClick={() => void addCredential()}
                    >
                      {credBusy && <Loader2Icon className="animate-spin" />}
                      <KeyRoundIcon />
                      {t("addCredential")}
                    </Button>
                  </div>
                  <ConfirmDialog
                    open={pendingCred !== null}
                    onOpenChange={(open) => {
                      if (!open) setPendingCred(null);
                    }}
                    title={t("revokeCredentialTitle")}
                    description={t("revokeCredentialHint")}
                    confirmLabel={t("revokeCredential")}
                    busy={credBusy}
                    onConfirm={() => {
                      if (pendingCred) void deleteCredential(pendingCred);
                    }}
                  />
                </>
              )}
            </CardContent>
          </Card>
          )}

          {section === "bindings" && (
          <Card className="bg-surface shadow-card h-fit">
            <CardHeader>
              <CardTitle className="font-display">{t("identitiesTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-text-muted text-sm">{t("identitiesHint")}</p>
              {binding?.required && binding.identities.length === 0 && (
                <p role="alert" className="text-danger text-sm">
                  {t("bindingRequired")}
                </p>
              )}
              {binding && binding.identities.length > 0 ? (
                // 不提供解绑：站点若强制绑定第三方，解绑会立刻把账号锁在功能之外
                <ul className="space-y-1.5 text-sm">
                  {binding.identities.map((id) => (
                    <li key={`${id.provider}:${id.subject}`} className="flex items-center gap-2">
                      <Link2Icon className="text-success size-4" />
                      <span>{id.provider}</span>
                      {id.email && <span className="text-text-muted truncate">{id.email}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                isAuthenticated && (
                  <div className="space-y-2">
                    {oauthProviders.map((m) => (
                      <Button
                        key={m.id}
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          window.location.assign(
                            apiClient.oauthUrl(m.id, window.location.origin + "/profile"),
                          )
                        }
                      >
                        <Link2Icon />
                        {t("bindWith", { provider: m.label })}
                      </Button>
                    ))}
                    {oauthProviders.length === 0 && (
                      <p className="text-text-muted text-sm">{t("noOauthProviders")}</p>
                    )}
                  </div>
                )
              )}
            </CardContent>
          </Card>
          )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// 用户中心侧栏：四个子页（概览/皮肤与玩家/安全/绑定），当前项高亮。
function UserNav({ section }: { section: UserSection }) {
  const t = useTranslations("profile");
  const items: { href: "/user" | `/user/${string}`; id: UserSection; icon: typeof ShieldIcon; label: string }[] = [
    { href: "/user", id: "overview", icon: LayoutDashboardIcon, label: t("navOverview") },
    { href: "/user/skin", id: "skin", icon: ShirtIcon, label: t("navSkin") },
    { href: "/user/security", id: "security", icon: ShieldIcon, label: t("navSecurity") },
    { href: "/user/bindings", id: "bindings", icon: Link2Icon, label: t("navBindings") },
  ];
  return (
    <nav
      className="flex gap-1 overflow-x-auto lg:sticky lg:top-20 lg:flex-col"
      aria-label={t("navLabel")}
    >
      {items.map((it) => (
        <Link
          key={it.id}
          href={it.href}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface hover:text-text",
            section === it.id ? "bg-surface text-text font-medium" : "text-text-muted",
          )}
        >
          <it.icon className="size-4" />
          {it.label}
        </Link>
      ))}
    </nav>
  );
}

// 概览：账号状态 + 玩家总览两卡并排，信息密度优先（导航在侧栏，不再重复链接卡）。
function OverviewSection({
  players,
  isAuthenticated,
}: {
  players: Player[];
  isAuthenticated: boolean;
}) {
  const t = useTranslations("profile");
  const [me, setMe] = useState<AccountMe | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient
      .me()
      .then(setMe)
      .catch(() => setMe(null));
  }, [isAuthenticated]);

  return (
    <div className="grid w-full gap-8 lg:grid-cols-2">
      <Card className="bg-surface shadow-card h-fit">
        <CardHeader>
          <CardTitle className="font-display">{t("accountTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {!isAuthenticated ? (
            <p className="text-text-muted flex items-center gap-1.5">
              <InfoIcon className="size-4" />
              {t("notLoggedIn")}
            </p>
          ) : (
            <>
              <Row label={t("meEmail")} value={me?.email ?? "—"} />
              <Row label={t("meNickname")} value={me?.nickname || "—"} />
              <Row
                label={t("meVerified")}
                value={
                  me === null ? (
                    "—"
                  ) : me.verified ? (
                    <Badge variant="secondary">{t("meVerifiedYes")}</Badge>
                  ) : (
                    <Badge variant="outline">{t("meVerifiedNo")}</Badge>
                  )
                }
              />
            </>
          )}
        </CardContent>
      </Card>
      <Card className="bg-surface shadow-card h-fit">
        <CardHeader>
          <CardTitle className="font-display">{t("playersTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!isAuthenticated ? (
            <p className="text-text-muted flex items-center gap-1.5 text-sm">
              <InfoIcon className="size-4" />
              {t("notLoggedIn")}
            </p>
          ) : players.length === 0 ? (
            <p className="text-text-muted text-sm">{t("noPlayers")}</p>
          ) : (
            players.map((p, i) => (
              <div key={p.id ?? i} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <PlayerAvatar name={p.name ?? ""} size={28} />
                  {p.name}
                </span>
                <span className="text-text-muted flex items-center gap-1 text-xs">
                  {p.premium && <Badge variant="outline">{t("premiumBadge")}</Badge>}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-muted shrink-0 text-xs">{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}

// 登录态改密：成功后全部会话失效，直接送登录页重新登录。
function ChangePasswordCard() {
  const t = useTranslations("profile");
  const errText = useErrorText();
  const router = useRouter();
  const { logout } = useAuth();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [req, setReq] = useState<RegisterRequirements | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiClient
      .registerRequirements()
      .then(setReq)
      .catch(() => setReq(null));
  }, []);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    
    if (next !== confirm) {
      toast.error(t("confirmMismatch"));
      setBusy(false);
      return;
    }
    try {
      await apiClient.changePassword(cur, next);
      // 改密即吊销全部会话：本地登出并回登录页
      await logout();
      router.push("/login");
    } catch (e) {
      toast.error(errText(e));
      setBusy(false);
    }
  };

  return (
    <Card className="bg-surface shadow-card h-fit">
      <CardHeader>
        <CardTitle className="font-display">{t("changePasswordTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="pw-cur">{t("currentPassword")}</Label>
          <Input
            id="pw-cur"
            type="password"
            autoComplete="current-password"
            value={cur}
            onChange={(e) => setCur(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw-new">{t("newPassword")}</Label>
          <Input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          {req && <PasswordChecklist policy={req.passwordPolicy} value={next} />}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pw-confirm">{t("confirmPassword")}</Label>
          <Input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {confirm !== "" && confirm !== next && (
            <p className="text-danger text-xs">{t("confirmMismatch")}</p>
          )}
        </div>
        <Button
          variant="outline"
          disabled={busy || !cur || !next}
          onClick={() => void submit()}
        >
          {busy && <Loader2Icon className="animate-spin" />}
          {t("changePasswordTitle")}
        </Button>
      </CardContent>
    </Card>
  );
}
