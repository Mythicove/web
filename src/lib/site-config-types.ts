export interface SiteThemeConfig {
  default: string;
  allowAdjust: boolean;
  selectable: string[];
}

// 品牌图标（运行时由管理后台上传、mirror 存储）；缺省回落 web 内置 /brand/*.png。
// 值为浏览器可达的绝对 URL（服务端按 NEXT_PUBLIC_API_URL 拼好）。
export interface SiteBrand {
  light?: string;
  dark?: string;
}

// 站点身份与自定义前端资产（运行时由管理后台维护、mirror 存储）。
// 文本缺省时前端回落 i18n 默认；customCss/Js 为同源文件绝对 URL（未设置则无）。
export interface SiteRuntime {
  name?: string;
  description?: string;
  copyright?: string;
  icp?: string;
  customCssUrl?: string;
  customJsUrl?: string;
}

export interface SiteConfig {
  modules: string[];
  theme: SiteThemeConfig;
  brand?: SiteBrand;
  site?: SiteRuntime;
}

export const DEFAULT_MODULES = ["skin", "mods"];

export const DEFAULT_CONFIG: SiteConfig = {
  modules: DEFAULT_MODULES,
  theme: {
    default: "default",
    allowAdjust: true,
    selectable: ["default", "ocean", "emerald", "rose", "amber", "slate"],
  },
};

// 归一化：缺字段回退默认，避免运行期配置写坏导致整站异常。
export function normalizeSiteConfig(parsed: unknown): SiteConfig {
  const p = (parsed ?? {}) as Partial<SiteConfig>;
  const modules =
    Array.isArray(p.modules) && p.modules.length > 0 ? p.modules : DEFAULT_CONFIG.modules;
  const theme = { ...DEFAULT_CONFIG.theme, ...(p.theme ?? {}) };
  if (!theme.selectable?.length) theme.selectable = [theme.default];
  return { modules, theme };
}
