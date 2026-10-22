"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getTheme, type Mode, type ThemeTokens } from "@/lib/themes";

interface SiteThemeConfig {
  default: string;
  allowAdjust: boolean;
  selectable: string[];
}

interface ThemeContextValue {
  themeId: string;
  mode: Mode;
  resolvedMode: "light" | "dark";
  allowAdjust: boolean;
  selectable: string[];
  setThemeId: (id: string) => void;
  setMode: (mode: Mode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_THEME = "mythicove-theme";
const STORAGE_MODE = "mythicove-mode";

function applyTokens(tokens: ThemeTokens) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(`--${key}`, value);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState("default");
  const [mode, setModeState] = useState<Mode>("auto");
  const [systemDark, setSystemDark] = useState(false);
  const [allowAdjust, setAllowAdjust] = useState(true);
  const [selectable, setSelectable] = useState<string[]>(["default"]);

  useEffect(() => {
    // 1) 读取站点主题配置（管理员可改 site-config.json）
    fetch("/site-config.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg: { theme?: SiteThemeConfig } | null) => {
        const t = cfg?.theme;
        if (t) {
          setAllowAdjust(t.allowAdjust);
          setSelectable(t.selectable?.length ? t.selectable : [t.default]);
          const saved = localStorage.getItem(STORAGE_THEME);
          const initial = t.allowAdjust && saved ? saved : t.default;
          if (initial !== themeId) setThemeIdState(initial);
        }
      })
      .catch(() => {});

    const savedMode = localStorage.getItem(STORAGE_MODE);
    if (savedMode) setModeState(savedMode as Mode);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolvedMode: "light" | "dark" =
    mode === "auto" ? (systemDark ? "dark" : "light") : mode;

  useEffect(() => {
    const theme = getTheme(themeId);
    applyTokens(resolvedMode === "dark" ? theme.dark : theme.light);
  }, [themeId, resolvedMode]);

  // 自定义主题覆盖（public/custom-theme.json，可选）
  useEffect(() => {
    fetch("/custom-theme.json")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (custom: { light?: Partial<ThemeTokens>; dark?: Partial<ThemeTokens> } | null) => {
          if (!custom) return;
          const theme = getTheme(themeId);
          const base = resolvedMode === "dark" ? theme.dark : theme.light;
          const override = resolvedMode === "dark" ? custom.dark : custom.light;
          if (override && Object.keys(override).length > 0) {
            applyTokens({ ...base, ...override });
          }
        },
      )
      .catch(() => {});
  }, [themeId, resolvedMode]);

  function setThemeId(id: string) {
    if (!allowAdjust) return;
    setThemeIdState(id);
    localStorage.setItem(STORAGE_THEME, id);
  }

  function setMode(m: Mode) {
    setModeState(m);
    localStorage.setItem(STORAGE_MODE, m);
  }

  return (
    <ThemeContext.Provider
      value={{ themeId, mode, resolvedMode, allowAdjust, selectable, setThemeId, setMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
