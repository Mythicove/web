"use client";

import { useEffect, useState } from "react";

export interface SiteConfig {
  modules: string[];
  theme: {
    default: string;
    allowAdjust: boolean;
    selectable: string[];
  };
}

export const DEFAULT_MODULES = ["skin", "mods"];

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    fetch("/site-config.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((c: SiteConfig | null) => setConfig(c))
      .catch(() => {});
  }, []);

  const modules = config?.modules ?? DEFAULT_MODULES;
  return {
    config,
    modules,
    has: (m: string) => modules.includes(m),
  };
}
