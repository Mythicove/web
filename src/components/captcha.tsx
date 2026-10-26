"use client";

// 类型导入：引入 cap-widget 的全局声明（window.CAP_CUSTOM_WASM_URL 等）
import type {} from "cap-widget";
import { useEffect, useRef } from "react";

interface CaptchaProps {
  driver: string;
  siteKey: string;
  /** cap driver 专用：Standalone 实例公网地址（requirements 下发 captchaCapUrl） */
  capUrl?: string;
  onToken: (token: string) => void;
}

interface CaptchaGlobals {
  turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => void };
  hCaptcha?: { render: (el: HTMLElement, opts: Record<string, unknown>) => void };
  grecaptcha?: { render: (el: HTMLElement, opts: Record<string, unknown>) => void };
}

const SCRIPTS: Record<string, string> = {
  turnstile: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
  hcaptcha: "https://js.hcaptcha.com/1/api.js?render=explicit",
  recaptcha: "https://www.google.com/recaptcha/api.js?render=explicit",
};

// 验证码控件：按后端 requirements 下发的 driver 动态加载对应 SDK（turnstile/hcaptcha/recaptcha），
// cap 走 npm 包 cap-widget（自定义元素，不依赖 CDN）。
export function Captcha({ driver, siteKey, capUrl, onToken }: CaptchaProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef(onToken);

  useEffect(() => {
    tokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (driver !== "cap" || !siteKey || !capUrl) return;
    let disposed = false;
    const mount = () => {
      const box = boxRef.current;
      if (disposed || !box || box.querySelector("cap-widget")) return;
      const widget = document.createElement("cap-widget");
      widget.setAttribute("data-cap-api-endpoint", `${capUrl.replace(/\/+$/, "")}/${siteKey}/`);
      widget.addEventListener("solve", (e) => {
        const token = (e as CustomEvent<{ token: string }>).detail.token;
        if (token) tokenRef.current(token);
      });
      box.appendChild(widget);
    };
    // 副作用导入：注册 <cap-widget> 自定义元素；按需分块，其余 driver 不加载
    import("cap-widget").then(
      async () => {
        // widget 默认从 jsdelivr 拉取 WASM（部分地区不可达）。实例开了 asset server
        // （ENABLE_ASSETS_SERVER=true）时改用自托管副本；探测失败保持默认，无回归。
        const base = capUrl.replace(/\/+$/, "");
        try {
          const wasm = await fetch(`${base}/assets/cap_wasm_bg.wasm`, { method: "HEAD" });
          if (wasm.ok) {
            window.CAP_CUSTOM_WASM_URL = `${base}/assets/cap_wasm_bg.wasm`;
            const hashwx = await fetch(`${base}/assets/hashwx.wasm`, { method: "HEAD" });
            if (hashwx.ok) window.CAP_CUSTOM_HASHWX_URL = `${base}/assets/hashwx.wasm`;
          }
        } catch {
          // 探测失败（无 asset server / CORS / 离线）：沿用 widget 默认 CDN
        }
        mount();
      },
      () => undefined,
    );
    return () => {
      disposed = true;
    };
  }, [driver, siteKey, capUrl]);

  useEffect(() => {
    if (driver === "cap") return;
    const src = SCRIPTS[driver];
    if (!src || !siteKey || !boxRef.current) return;
    const render = () => {
      const win = window as unknown as CaptchaGlobals;
      const el = boxRef.current;
      if (!el) return;
      const opts = { sitekey: siteKey, callback: (t: string) => tokenRef.current(t) };
      if (driver === "turnstile") win.turnstile?.render(el, opts);
      else if (driver === "hcaptcha") win.hCaptcha?.render(el, opts);
      else if (driver === "recaptcha") win.grecaptcha?.render(el, opts);
    };
    if (document.querySelector(`script[src="${src}"]`)) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [driver, siteKey]);

  if (!driver || !siteKey) return null;
  return <div ref={boxRef} className="min-h-16" />;
}
