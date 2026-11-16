export type Mode = "light" | "dark" | "auto";

export interface ThemeTokens {
  primary: string;
  "primary-hover": string;
  "primary-solid": string;
  "primary-foreground": string;
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
  success: "#3fb950",
  warning: "#d9a441",
  danger: "#e5534b",
};

// 中性基底：暖调石灰白 / 深石墨，去掉了旧蓝紫 navy 的通用感（体素极简的地基）。
// 所有主题共用同一套基底，只换强调色——「一个系统，强调色才是人格旋钮」。
const lightNeutral = {
  bg: "#f6f7f4",
  surface: "#ffffff",
  "surface-raised": "#ffffff",
  border: "#e2e6df",
  text: "#161a17",
  "text-muted": "#5c635d",
  // 浅色层级阴影用低透明度绿黑（体素极简 §depth），不用纯黑重影
  "shadow-tint": "#1b2a1b14",
  "shadow-tint-strong": "#1b2a1b26",
};

const darkNeutral = {
  bg: "#0e100f",
  surface: "#1a1e1c",
  "surface-raised": "#232826",
  border: "#333936",
  text: "#e8ebe7",
  "text-muted": "#98a09a",
  "shadow-tint": "#06090759",
  "shadow-tint-strong": "#06090780",
};

// primary 一身兼两职会打架：当"背景上的强调色"（链接/图标/焦点环）需要鲜亮以在底色上达标，
// 当"填充面"（按钮/徽章/选区）又需要够深才能配白字。拆成两个 token：
//   primary       = 背景上的强调色（深色模式鲜亮、浅色模式加深）
//   primary-solid = 填充面（饱和中深，配白字；金/石这类天生浅的填充仍由 readableOn 配黑字）
// primary-hover 是填充面的 hover。
type Accent = Pick<
  ThemeTokens,
  "primary" | "primary-hover" | "primary-solid" | "accent" | "highlight"
>;

// 填充面上的文字按 WCAG 相对亮度自动取黑/白：交叉点 ~0.179 之上用近黑、之下用白。
// 只对 primary-solid 计算，保证深绿/深青填充配白字、金/石浅填充配黑字。
function readableOn(hex: string): string {
  const c = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const L = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  return L > 0.179 ? "#0b0f0c" : "#ffffff";
}

// 主题名不写死在这里：展示文案走 i18n（messages 的 theme.name.<id>），
// 否则英文界面会显示中文名。id 同时是 localStorage 值与消息键后缀。
function makeTheme(id: string, light: Accent, dark: Accent): Theme {
  return {
    id,
    light: {
      ...lightNeutral,
      ...light,
      "primary-foreground": readableOn(light["primary-solid"]),
      ...status,
    },
    dark: {
      ...darkNeutral,
      ...dark,
      "primary-foreground": readableOn(dark["primary-solid"]),
      ...status,
    },
  };
}

// 六套强调色对应六种 Minecraft 材质：草方块 / 水 / 翡翠块 / 红石 / 金锭 / 石头。
// 共用同一套中性基底，只换强调色——主题即材质，而非同一配方的色相旋转。
export const themes: Theme[] = [
  makeTheme(
    "default",
    {
      primary: "#2f7d22",
      "primary-solid": "#2f7d22",
      "primary-hover": "#25641b",
      accent: "#4a9b37",
      highlight: "#0f9e8e",
    },
    {
      primary: "#63bb4a",
      "primary-solid": "#238636",
      "primary-hover": "#2ea043",
      accent: "#7cc463",
      highlight: "#4fd6c3",
    },
  ),
  makeTheme(
    "ocean",
    {
      primary: "#0e7490",
      "primary-solid": "#0e7490",
      "primary-hover": "#0c6278",
      accent: "#0891b2",
      highlight: "#0e7490",
    },
    {
      primary: "#22b8cf",
      "primary-solid": "#0e7490",
      "primary-hover": "#0891b2",
      accent: "#2dd4bf",
      highlight: "#67e8f9",
    },
  ),
  makeTheme(
    "emerald",
    {
      primary: "#0c7550",
      "primary-solid": "#0c7550",
      "primary-hover": "#0a6244",
      accent: "#10b981",
      highlight: "#14b8a6",
    },
    {
      primary: "#2fd39a",
      "primary-solid": "#0c7550",
      "primary-hover": "#0f8a5f",
      accent: "#34d399",
      highlight: "#5eead4",
    },
  ),
  makeTheme(
    "rose",
    {
      primary: "#c0262c",
      "primary-solid": "#c0262c",
      "primary-hover": "#a91f25",
      accent: "#e11d48",
      highlight: "#f43f5e",
    },
    {
      primary: "#f2555a",
      "primary-solid": "#c0262c",
      "primary-hover": "#d92d34",
      accent: "#fb7185",
      highlight: "#fda4af",
    },
  ),
  makeTheme(
    "amber",
    {
      primary: "#8a6212",
      "primary-solid": "#8a6212",
      "primary-hover": "#74520e",
      accent: "#d9a441",
      highlight: "#ca8a04",
    },
    {
      primary: "#e0a63c",
      "primary-solid": "#e0a63c",
      "primary-hover": "#f0b854",
      accent: "#fbbf24",
      highlight: "#fde68a",
    },
  ),
  makeTheme(
    "slate",
    {
      primary: "#556070",
      "primary-solid": "#556070",
      "primary-hover": "#465061",
      accent: "#64748b",
      highlight: "#94a3b8",
    },
    {
      primary: "#a3adba",
      "primary-solid": "#a3adba",
      "primary-hover": "#b6c0cc",
      accent: "#94a3b8",
      highlight: "#cbd5e1",
    },
  ),
];

export function getTheme(id: string): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}
