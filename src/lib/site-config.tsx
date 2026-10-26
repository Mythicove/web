"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_CONFIG, type SiteConfig } from "./site-config-types";

// 站点配置单一来源：layout 服务端读取 public/site-config.json 后经 Provider 下发，
// 客户端不再各自 fetch（消除重复请求与导航闪现）。
const SiteConfigContext = createContext<SiteConfig>(DEFAULT_CONFIG);

export function SiteConfigProvider({
  config,
  children,
}: {
  config: SiteConfig;
  children: ReactNode;
}) {
  return <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  const config = useContext(SiteConfigContext);
  return {
    config,
    modules: config.modules,
    has: (m: string) => config.modules.includes(m),
  };
}
