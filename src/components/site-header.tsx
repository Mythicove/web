"use client";

import { useTranslations, useLocale } from "next-intl";
import { GlobeIcon, LogOutIcon, MenuIcon, SettingsIcon, UserRoundIcon } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { useSiteConfig } from "@/lib/site-config";
import { useAuth } from "@/lib/auth";
import { useHoardUser } from "@/lib/hoard-auth";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { PlayerAvatar } from "@/components/player-avatar";
import { cn } from "@/lib/utils";

function LanguageMenu({ compact = false }: { compact?: boolean }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const switchLocale = (next: string) => router.replace(pathname, { locale: next });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size={compact ? "sm" : "sm"} />}
        aria-label={t("lang.label")}
      >
        <GlobeIcon />
        {locale === "zh-CN" ? "中文" : "EN"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => switchLocale("zh-CN")}>中文</DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale("en")}>English</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// mods 模块的 SSO 身份独立于 mirror 会话，仅在菜单内按需加载，避免每页多发一次请求。
// 登录入口全站唯一（顶栏"登录 / 注册"）：未同步 hoard 会话时不在此重复提供登录项，
// mods 页会静默同步；此处只展示已同步的身份与登出。
function HoardIdentity() {
  const t = useTranslations("mods");
  const { user, loaded, logout } = useHoardUser();
  if (!loaded || !user) return null;
  return (
    <>
      <div className="text-text-muted px-2 py-1.5 text-xs">
        {t("signedInAs", { name: user.username })}
      </div>
      <DropdownMenuItem onClick={() => void logout()}>{t("ssoLogout")}</DropdownMenuItem>
    </>
  );
}

function AccountMenu() {
  const t = useTranslations();
  const { has } = useSiteConfig();
  const { allowAdjust } = useTheme();
  const { auth, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" />}
        aria-label={t("nav.account")}
      >
        {auth?.playerName ? (
          <PlayerAvatar name={auth.playerName} size={20} className="rounded-[5px]" />
        ) : (
          <UserRoundIcon />
        )}
        <span className="max-w-[8rem] truncate">{auth?.playerName ?? t("nav.account")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {has("skin") && (
          <DropdownMenuItem render={<Link href="/profile" />}>{t("nav.profile")}</DropdownMenuItem>
        )}
        {allowAdjust && (
          <DropdownMenuItem render={<Link href="/settings" />}>
            <SettingsIcon />
            {t("nav.settings")}
          </DropdownMenuItem>
        )}
        {has("mods") && <HoardIdentity />}
        <DropdownMenuItem onClick={() => void logout()}>
          <LogOutIcon />
          {t("nav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const t = useTranslations();
  const { allowAdjust } = useTheme();
  const { has } = useSiteConfig();
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    ...(has("skin") ? [{ href: "/skins" as const, label: t("nav.skins") }] : []),
    ...(has("mods") ? [{ href: "/mods" as const, label: t("nav.mods") }] : []),
  ];
  const linkClass = (href: string) =>
    cn(
      "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-surface hover:text-text",
      pathname === href ? "bg-surface text-text" : "text-text-muted",
    );

  return (
    <header className="border-border bg-bg/80 sticky top-0 z-40 border-b backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" aria-label="Mythicove" className="shrink-0">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageMenu />
          {isAuthenticated ? (
            <AccountMenu />
          ) : (
            <Button render={<Link href="/login" />} size="sm">
              {t("nav.login")}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <LanguageMenu compact />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" />}
              aria-label={t("common.openMenu")}
            >
              <MenuIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navLinks.map((l) => (
                <DropdownMenuItem key={l.href} render={<Link href={l.href} />}>
                  {l.label}
                </DropdownMenuItem>
              ))}
              {isAuthenticated ? (
                <>
                  {has("skin") && (
                    <DropdownMenuItem render={<Link href="/profile" />}>
                      {t("nav.profile")}
                    </DropdownMenuItem>
                  )}
                  {allowAdjust && (
                    <DropdownMenuItem render={<Link href="/settings" />}>
                      <SettingsIcon />
                      {t("nav.settings")}
                    </DropdownMenuItem>
                  )}
                  {has("mods") && <HoardIdentity />}
                  <DropdownMenuItem onClick={() => void logout()}>
                    <LogOutIcon />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem render={<Link href="/login" />}>
                  {t("nav.login")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
