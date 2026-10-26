export interface SiteThemeConfig {
  default: string;
  allowAdjust: boolean;
  selectable: string[];
}

export interface SiteConfig {
  modules: string[];
  theme: SiteThemeConfig;
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
