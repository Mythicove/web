// 主题偏好的 localStorage 键：内联首屏脚本与 ThemeProvider 共用，避免两处字面量漂移。
export const STORAGE_THEME = "mythicove-theme";
export const STORAGE_MODE = "mythicove-mode";

// 同标签页内 localStorage 写入不触发 storage 事件，用自定义事件通知 store 订阅者。
export const THEME_STORE_EVENT = "mythicove-theme-store";

export function notifyThemeStore() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(THEME_STORE_EVENT));
}
