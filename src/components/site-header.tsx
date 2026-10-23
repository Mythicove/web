"use client";

import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "@/lib/theme-provider";
import { useSiteConfig } from "@/lib/site-config";
import { useAuth } from "@/lib/auth";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const t = useTranslations();
  const { allowAdjust } = useTheme();
  const { has } = useSiteConfig();
  const { auth, isAuthenticated, logout } = useAuth();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (next: string) => {
    router.replace(pathname, { locale: next });
  };

  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gradient-to-br from-highlight to-accent" />
          <span className="font-display text-lg font-semibold">Mythic Mirror</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-text-muted">
          {has("skin") && (
            <>
              <a href="#features" className="hover:text-text">
                {t("nav.features")}
              </a>
              <Link href="/skins" className="hover:text-text">
                {t("nav.skins")}
              </Link>
            </>
          )}
          {has("mods") && (
            <Link href="/mods" className="hover:text-text">
              {t("nav.mods")}
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
              {locale === "zh-CN" ? "中文" : "EN"}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => switchLocale("zh-CN")}>中文</DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchLocale("en")}>English</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {allowAdjust && (
            <Link href="/settings" className="hover:text-text">
              {t("nav.settings")}
            </Link>
          )}

          {isAuthenticated ? (
            <>
              {has("skin") && (
                <Link href="/profile" className="hover:text-text">
                  {t("nav.profile")}
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
                  {auth?.playerName ?? t("nav.account")}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout}>{t("nav.logout")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-hover"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
