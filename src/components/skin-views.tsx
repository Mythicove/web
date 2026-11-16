"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { XIcon } from "lucide-react";
import { apiClient } from "@/lib/api";

const VIEWS = ["body", "back", "side"] as const;
type View = (typeof VIEWS)[number];

// 皮肤 2D 三视图：卡片给缩略，点击放大对照（正面/背面/侧面）。
// 图由 mirror 按 UV 展开渲染，前端不做像素搬运，规则单点在后端。
export function SkinViews({ playerName }: { playerName: string }) {
  const t = useTranslations("skinDetail");
  const [open, setOpen] = useState(false);
  const label: Record<View, string> = {
    body: t("viewFront"),
    back: t("viewBack"),
    side: t("viewSide"),
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setOpen(true)}
            className="border-border bg-bg hover:border-primary overflow-hidden rounded-md border transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- 后端渲染的视图 PNG */}
            <img
              src={apiClient.renderByNameUrl(playerName, v, 8)}
              alt={label[v]}
              loading="lazy"
              decoding="async"
              className="aspect-[1/2] w-full object-contain [image-rendering:pixelated]"
            />
            <span className="text-text-muted block pb-1.5 text-xs">{label[v]}</span>
          </button>
        ))}
      </div>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          role="dialog"
          aria-modal="true"
          aria-label={t("views")}
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface border-border shadow-pop relative grid max-h-full grid-cols-3 gap-6 overflow-auto rounded-xl border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="text-text-muted hover:text-text absolute top-3 right-3"
              onClick={() => setOpen(false)}
              aria-label={t("viewClose")}
            >
              <XIcon className="size-5" />
            </button>
            {VIEWS.map((v) => (
              <div key={v} className="flex flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- 后端渲染的视图 PNG */}
                <img
                  src={apiClient.renderByNameUrl(playerName, v, 16)}
                  alt={label[v]}
                  className="max-h-[60vh] w-auto object-contain [image-rendering:pixelated]"
                />
                <span className="text-text-muted text-xs">{label[v]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
