"use client";

import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";

// 品牌标识使用仓库内真实 logo（docs/src/assets/logo-{light,dark}.png，
// 同步至 public/brand/），按当前主题切换浅/深底版本，以圆角图标 tile 呈现。
export function LogoMark({ className }: { className?: string }) {
  const { resolvedMode } = useTheme();
  const src = resolvedMode === "dark" ? "/brand/logo-dark.png" : "/brand/logo-light.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 品牌位图为静态资源，需按主题切换 src
    <img
      src={src}
      alt=""
      width={64}
      height={64}
      className={cn("ring-foreground/10 size-8 shrink-0 rounded-[22%] ring-1", className)}
    />
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
