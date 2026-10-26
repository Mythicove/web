"use client";

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
    import("cap-widget").then(mount, () => undefined);
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
