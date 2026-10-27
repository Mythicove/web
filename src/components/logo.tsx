"use client";

import { useSiteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

// 品牌标识：优先用管理后台上传的自定义明暗图（SiteConfig.brand，由 layout 服务端
// 注入、首帧 HTML 即含正确 src），缺省回落仓库内置 /brand/logo-{light,dark}.png。
// 明暗双图同时渲染、由 CSS 依 html[data-mode] 选其一（见 globals.css），不依赖水合、不闪。
const tileClass = "ring-foreground/10 size-8 shrink-0 rounded-[22%] ring-1";
const DEFAULT_LIGHT = "/brand/logo-light.png";
const DEFAULT_DARK = "/brand/logo-dark.png";

export function LogoMark({ className }: { className?: string }) {
  const { config } = useSiteConfig();
  const light = config.brand?.light || DEFAULT_LIGHT;
  const dark = config.brand?.dark || DEFAULT_DARK;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- 品牌位图为静态资源，明暗双图由 CSS 切换 */}
      <img
        src={light}
        alt=""
        width={64}
        height={64}
        className={cn(tileClass, "logo-light", className)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- 品牌位图为静态资源，明暗双图由 CSS 切换 */}
      <img
        src={dark}
        alt=""
        width={64}
        height={64}
        className={cn(tileClass, "logo-dark", className)}
      />
    </>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-text text-lg font-semibold tracking-tight">Mythicove</span>
    </span>
  );
}
