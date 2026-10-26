"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SkinViewer } from "skinview3d";
import { cn } from "@/lib/utils";

interface SkinPreviewProps {
  skinUrl: string;
  className?: string;
  label?: string;
}

// 3D 皮肤预览：容器测量 + DPR 感知 + 尊重减弱动效 + 加载/失败回退。
// 外层"展台"提供地面投影，作为页面的真实视觉锚点（设计文档 §5）。
export function SkinPreview({ skinUrl, className, label }: SkinPreviewProps) {
  const t = useTranslations("common");
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let disposed = false;
    setState("loading");

    const viewer = new SkinViewer({
      canvas,
      width: wrap.clientWidth || 280,
      height: wrap.clientHeight || 360,
    });
    viewer.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const fit = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w <= 0 || h <= 0) return;
      viewer.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      viewer.renderer.setSize(w, h, false);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    viewer
      .loadSkin(skinUrl)
      .then(() => {
        if (!disposed) setState("ready");
      })
      .catch(() => {
        if (!disposed) setState("error");
      });

    return () => {
      disposed = true;
      ro.disconnect();
      viewer.dispose();
    };
  }, [skinUrl]);

  return (
    <div className={cn("flex w-full flex-col items-center gap-4", className)}>
      <div
        ref={wrapRef}
        // 固定宽高比：任何容器宽度下预览盒都不会退化为竖长/细条形态
        className="border-border bg-surface shadow-card relative aspect-[10/9] w-full max-w-[320px] overflow-hidden rounded-xl border"
      >
        {state === "loading" && (
          <div className="bg-surface-raised absolute inset-0 animate-pulse" aria-hidden="true" />
        )}
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={label ?? t("preview3d")}
          className={cn("h-full w-full", state !== "ready" && "opacity-0")}
        />
        {state === "error" && (
          // eslint-disable-next-line @next/next/no-img-element -- 3D 加载失败的回退静态贴图，像素风需 image-rendering 控制
          <img
            src={skinUrl}
            alt={label ?? t("preview3d")}
            className="absolute inset-0 h-full w-full object-contain p-6 [image-rendering:pixelated]"
          />
        )}
      </div>
      <div
        aria-hidden="true"
        className="h-3 w-2/3 max-w-[220px] rounded-full bg-(--shadow-tint-strong) blur-md"
      />
    </div>
  );
}
