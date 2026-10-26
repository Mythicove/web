"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";
import { LogOutIcon, RefreshCwIcon, SettingsIcon, UploadIcon } from "lucide-react";
import { useHoardUser } from "@/lib/hoard-auth";
import { useAuth } from "@/lib/auth";
import { hoardClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { Skeleton } from "@/components/skeleton";

const SSO_ATTEMPT_KEY = "mythicove:mods-sso-attempted";

// 同步尝试标记作为外部 store：水合期用服务端快照（null）避免水合差异。
const subscribeNoop = () => () => {};
const getAttempted = () => sessionStorage.getItem(SSO_ATTEMPT_KEY);
const getAttemptedServer = () => null;

// mods 模块的登录态岛。
// 登录入口全站唯一（顶栏"登录 / 注册"）：mods 与皮肤站共享 mirror 会话，
// 已登录站点时静默走 OIDC（first-party 免同意）建立 hoard 会话，不重复放登录按钮；
// 同步失败给"重试同步"，匿名仅给提示文案。
export function ModsSessionBar() {
  const t = useTranslations("mods");
  const { isAuthenticated } = useAuth();
  const { user, loaded, logout } = useHoardUser();
  const pathname = usePathname();
  const attempted = useSyncExternalStore(subscribeNoop, getAttempted, getAttemptedServer) !== null;

  useEffect(() => {
    if (!isAuthenticated) sessionStorage.removeItem(SSO_ATTEMPT_KEY);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !loaded || user || attempted) return;
    sessionStorage.setItem(SSO_ATTEMPT_KEY, "1");
    window.location.assign(hoardClient.loginUrl(pathname));
  }, [isAuthenticated, loaded, user, attempted, pathname]);

  if (!loaded) return <Skeleton className="h-7 w-40" />;

  if (user) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-text-muted">{t("signedInAs", { name: user.username })}</span>
        <Button size="sm" render={<Link href="/mods/upload" />}>
          <UploadIcon />
          {t("uploadMod")}
        </Button>
        <Button size="sm" variant="outline" render={<Link href="/mods/settings" />}>
          <SettingsIcon />
          {t("settings")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => void logout()}>
          <LogOutIcon />
          {t("ssoLogout")}
        </Button>
      </div>
    );
  }

  if (isAuthenticated) {
    return attempted ? (
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          sessionStorage.removeItem(SSO_ATTEMPT_KEY);
          window.location.assign(hoardClient.loginUrl(pathname));
        }}
      >
        <RefreshCwIcon />
        {t("ssoRetry")}
      </Button>
    ) : (
      <span className="text-text-muted text-sm">{t("syncing")}</span>
    );
  }

  return <span className="text-text-muted text-sm">{t("anonHint")}</span>;
}
