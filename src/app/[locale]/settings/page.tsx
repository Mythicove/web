"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "@/lib/theme-provider";
import { themes } from "@/lib/themes";
import { SiteHeader } from "@/components/site-header";

export default function SettingsPage() {
  const t = useTranslations();
  const { themeId, mode, allowAdjust, selectable, setThemeId, setMode } = useTheme();

  const selectableThemes = themes.filter((th) => selectable.includes(th.id));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <h1 className="font-display text-2xl font-semibold">{t("settings.title")}</h1>

          {!allowAdjust ? (
            <p className="mt-4 text-sm text-text-muted">{t("settings.locked")}</p>
          ) : (
            <>
              <h2 className="mt-8 text-sm text-text-muted">{t("theme.palette")}</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {selectableThemes.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setThemeId(th.id)}
                    className={`rounded-md border px-4 py-2 text-sm ${
                      th.id === themeId
                        ? "border-primary bg-primary text-white"
                        : "border-border hover:bg-surface"
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>

              <h2 className="mt-8 text-sm text-text-muted">{t("theme.mode")}</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {(["auto", "light", "dark"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded-md border px-4 py-2 text-sm ${
                      m === mode
                        ? "border-primary bg-primary text-white"
                        : "border-border hover:bg-surface"
                    }`}
                  >
                    {t(`theme.${m}`)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
