"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { getTheme, type Mode, type ThemeTokens } from "@/lib/themes";
import { useSiteConfig } from "@/lib/site-config";
import {
  notifyThemeStore,
  STORAGE_MODE,
  STORAGE_THEME,
  THEME_STORE_EVENT,
} from "@/lib/theme-storage";

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

// 空字符串经 setProperty 会删除内联变量（CSSOM 语义），使主题回落到 :root 默认值，
// 因此所有进入样式表的 token 必须先过这道过滤。
function isUsableToken(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function applyTokens(tokens: ThemeTokens) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    if (!isUsableToken(value)) continue;
    root.style.setProperty(`--${key}`, value);
  }
}

function usableTokens(tokens: Partial<ThemeTokens>): Partial<ThemeTokens> {
  return Object.fromEntries(Object.entries(tokens).filter(([, value]) => isUsableToken(value)));
}

// localStorage 偏好作为外部 store：SSR/水合用 serverSnapshot（默认值），
// 水合后同步到已保存值，避免服务器/客户端渲染不一致的水合告警。
function makeStorageStore(key: string, fallback: string) {
  const subscribe = (onChange: () => void) => {
    window.addEventListener(THEME_STORE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(THEME_STORE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  };
  const getSnapshot = () => localStorage.getItem(key) ?? fallback;
  const getServerSnapshot = () => fallback;
  return { subscribe, getSnapshot, getServerSnapshot };
}

const themeStore = makeStorageStore(STORAGE_THEME, "__default__");
const modeStore = makeStorageStore(STORAGE_MODE, "auto");

// 系统深浅色偏好作为外部 store 订阅，避免 effect 内 setState 的级联渲染。
let mediaQuery: MediaQueryList | null = null;
function getMediaQuery() {
  mediaQuery ??= window.matchMedia("(prefers-color-scheme: dark)");
  return mediaQuery;
}
const subscribeSystemDark = (onChange: () => void) => {
  const mq = getMediaQuery();
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const getSystemDark = () => getMediaQuery().matches;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { config } = useSiteConfig();
  const allowAdjust = config.theme.allowAdjust;
  const selectable = config.theme.selectable;

  // 偏好来自 localStorage store：水合期用服务端快照（默认值），水合后同步已保存值；
  // 首屏视觉由 ThemeInitScript 提前落 token，二者配合既无 FOUC 也无水合告警。
  const storedTheme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  );
  const storedMode = useSyncExternalStore(
    modeStore.subscribe,
    modeStore.getSnapshot,
    modeStore.getServerSnapshot,
  );
  const themeId = allowAdjust && storedTheme !== "__default__" ? storedTheme : config.theme.default;
  const mode: Mode = storedMode === "light" || storedMode === "dark" ? storedMode : "auto";
  const systemDark = useSyncExternalStore(subscribeSystemDark, getSystemDark, () => false);

  const resolvedMode: "light" | "dark" = mode === "auto" ? (systemDark ? "dark" : "light") : mode;

  // 先落基础主题，再叠加站点级自定义覆盖（public/custom-theme.json，可选）。
  // 覆盖值逐键过滤：空值不得进入样式表，否则整组变量被删除并回落到 :root 默认。
  useEffect(() => {
    let cancelled = false;
    const base = resolvedMode === "dark" ? getTheme(themeId).dark : getTheme(themeId).light;
    applyTokens(base);
    // 原生控件（select / file / checkbox / 滚动条）依 color-scheme 取 OS 深浅样式，
    // 不设置则深色 UI 里会出现浅色系统控件。
    const root = document.documentElement;
    root.style.colorScheme = resolvedMode;
    // 滚动条槽常驻：长短页/加载态切换不因滚动条出现与消失产生横向扰动。
    // 走 JS 而非 CSS：构建管线（Lightning CSS）会丢弃 scrollbar-gutter 声明。
    root.style.scrollbarGutter = "stable";
    root.style.scrollbarColor = "var(--surface-raised) var(--bg)";
    fetch("/custom-theme.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((custom: { light?: Partial<ThemeTokens>; dark?: Partial<ThemeTokens> } | null) => {
        if (cancelled || !custom) return;
        const override = usableTokens(
          resolvedMode === "dark" ? (custom.dark ?? {}) : (custom.light ?? {}),
        );
        if (Object.keys(override).length > 0) applyTokens({ ...base, ...override });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [themeId, resolvedMode]);

  function setThemeId(id: string) {
    if (!allowAdjust) return;
    localStorage.setItem(STORAGE_THEME, id);
    notifyThemeStore();
  }

  function setMode(m: Mode) {
    localStorage.setItem(STORAGE_MODE, m);
    notifyThemeStore();
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
