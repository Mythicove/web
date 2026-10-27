import { themes } from "@/lib/themes";
import { STORAGE_MODE, STORAGE_THEME } from "@/lib/theme-storage";
import type { SiteConfig } from "@/lib/site-config-types";

// 首屏阻塞脚本：在 React 水合前按已保存偏好落主题 token 与 color-scheme，
// 消除"首帧永远是默认深色"的 FOUC。与 ThemeProvider 共用同一份 token 表与键名。
export function ThemeInitScript({ config }: { config: SiteConfig }) {
  const payload = JSON.stringify({
    themes,
    defaultId: config.theme.default,
    allowAdjust: config.theme.allowAdjust,
    themeKey: STORAGE_THEME,
    modeKey: STORAGE_MODE,
  });
  const js = `(function(){try{var d=${payload};var m=localStorage.getItem(d.modeKey)||"auto";var dark=m==="dark"||(m==="auto"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var id=d.allowAdjust?localStorage.getItem(d.themeKey):null;var th=null;for(var i=0;i<d.themes.length;i++){if(d.themes[i].id===id){th=d.themes[i];}}th=th||d.themes[0];if(!th)return;var t=dark?th.dark:th.light;var s=document.documentElement.style;for(var k in t){if(typeof t[k]==="string"&&t[k]!==""){s.setProperty("--"+k,t[k]);}}s.colorScheme=dark?"dark":"light";document.documentElement.dataset.mode=dark?"dark":"light";s.scrollbarGutter="stable";s.scrollbarColor="var(--surface-raised) var(--bg)";}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
