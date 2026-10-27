import { cn } from "@/lib/utils";

// 品牌标识使用仓库内真实 logo（docs/src/assets/logo-{light,dark}.png，同步至 public/brand/）。
// 明暗双图同时渲染，由 CSS 依 html[data-mode] 显示其一（见 globals.css）——
// data-mode 在首帧内联脚本即写好，故不再有"先浅色再闪成深色"的水合切换。
const tileClass = "ring-foreground/10 size-8 shrink-0 rounded-[22%] ring-1";

export function LogoMark({ className }: { className?: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- 品牌位图为静态资源，明暗双图由 CSS 切换 */}
      <img
        src="/brand/logo-light.png"
        alt=""
        width={64}
        height={64}
        className={cn(tileClass, "logo-light", className)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- 品牌位图为静态资源，明暗双图由 CSS 切换 */}
      <img
        src="/brand/logo-dark.png"
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
