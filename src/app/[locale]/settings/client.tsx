"use client";

import { useTranslations } from "next-intl";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { getTheme, themes, type Mode } from "@/lib/themes";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

const MODE_ICONS: Record<Mode, typeof SunIcon> = {
  auto: MonitorIcon,
  light: SunIcon,
  dark: MoonIcon,
};

export function SettingsPageClient() {
  const t = useTranslations();
  const { themeId, mode, resolvedMode, allowAdjust, selectable, setThemeId, setMode } = useTheme();

  const selectableThemes = themes.filter((th) => selectable.includes(th.id));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <h1 className="font-display text-2xl font-semibold">{t("settings.title")}</h1>

          {!allowAdjust ? (
            <p className="text-text-muted mt-4 text-sm">{t("settings.locked")}</p>
          ) : (
            <>
              <h2 className="text-text-muted mt-8 text-sm">{t("theme.palette")}</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {selectableThemes.map((th) => {
                  const def = getTheme(th.id);
                  const swatch = resolvedMode === "dark" ? def.dark.primary : def.light.primary;
                  const active = th.id === themeId;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setThemeId(th.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-card"
                          : "border-border hover:bg-surface",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="ring-foreground/20 size-3 rounded-full ring-1"
                        style={{ background: swatch }}
                      />
                      {t(`theme.name.${th.id}`)}
                    </button>
                  );
                })}
              </div>

              <h2 className="text-text-muted mt-8 text-sm">{t("theme.mode")}</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {(["auto", "light", "dark"] as const).map((m) => {
                  const Icon = MODE_ICONS[m];
                  const active = m === mode;
                  return (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setMode(m)}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-card"
                          : "border-border hover:bg-surface",
                      )}
                    >
                      <Icon className="size-4" />
                      {t(`theme.${m}`)}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
