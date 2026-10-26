export type Mode = "light" | "dark" | "auto";

export interface ThemeTokens {
  primary: string;
  "primary-hover": string;
  accent: string;
  highlight: string;
  bg: string;
  surface: string;
  "surface-raised": string;
  border: string;
  text: string;
  "text-muted": string;
  success: string;
  warning: string;
  danger: string;
  "shadow-tint": string;
  "shadow-tint-strong": string;
}

export interface Theme {
  id: string;
  light: ThemeTokens;
  dark: ThemeTokens;
}

const status = {
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#f43f5e",
};

const lightNeutral = {
  bg: "#f8fafc",
  surface: "#ffffff",
  "surface-raised": "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  "text-muted": "#64748b",
  // 浅色层级阴影用低透明度深蓝（设计文档 §3.8），不用纯黑重影
  "shadow-tint": "#0f172a14",
  "shadow-tint-strong": "#0f172a29",
};

const darkNeutral = {
  bg: "#0b1026",
  surface: "#1a1f3a",
  "surface-raised": "#232a4d",
  border: "#2a3150",
  text: "#e6e9f5",
  "text-muted": "#9aa0b8",
  "shadow-tint": "#00000059",
  "shadow-tint-strong": "#00000073",
};

type Accent = Pick<ThemeTokens, "primary" | "primary-hover" | "accent" | "highlight">;

// 主题名不写死在这里：展示文案走 i18n（messages 的 theme.name.<id>），
// 否则英文界面会显示中文名。id 同时是 localStorage 值与消息键后缀。
function makeTheme(id: string, light: Accent, dark: Accent): Theme {
  return {
    id,
    light: { ...lightNeutral, ...light, ...status },
    dark: { ...darkNeutral, ...dark, ...status },
  };
}

export const themes: Theme[] = [
  makeTheme(
    "default",
    { primary: "#4f46e5", "primary-hover": "#4338ca", accent: "#8b5cf6", highlight: "#0ea5e9" },
    { primary: "#6366f1", "primary-hover": "#818cf8", accent: "#a78bfa", highlight: "#38bdf8" },
  ),
  makeTheme(
    "ocean",
    { primary: "#0284c7", "primary-hover": "#0369a1", accent: "#14b8a6", highlight: "#22d3ee" },
    { primary: "#38bdf8", "primary-hover": "#7dd3fc", accent: "#2dd4bf", highlight: "#67e8f9" },
  ),
  makeTheme(
    "emerald",
    { primary: "#059669", "primary-hover": "#047857", accent: "#10b981", highlight: "#34d399" },
    { primary: "#34d399", "primary-hover": "#6ee7b7", accent: "#10b981", highlight: "#5eead4" },
  ),
  makeTheme(
    "rose",
    { primary: "#e11d48", "primary-hover": "#be123c", accent: "#f43f5e", highlight: "#fb7185" },
    { primary: "#fb7185", "primary-hover": "#fda4af", accent: "#f43f5e", highlight: "#fda4af" },
  ),
  makeTheme(
    "amber",
    { primary: "#d97706", "primary-hover": "#b45309", accent: "#f59e0b", highlight: "#fbbf24" },
    { primary: "#fbbf24", "primary-hover": "#fcd34d", accent: "#f59e0b", highlight: "#fde68a" },
  ),
  makeTheme(
    "slate",
    { primary: "#475569", "primary-hover": "#334155", accent: "#64748b", highlight: "#94a3b8" },
    { primary: "#94a3b8", "primary-hover": "#cbd5e1", accent: "#64748b", highlight: "#cbd5e1" },
  ),
];

export function getTheme(id: string): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}
