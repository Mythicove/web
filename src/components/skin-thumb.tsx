"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SkinThumbProps {
  src: string;
  alt: string;
  className?: string;
}

// 皮肤缩略图：固定宽高比盒 + 加载期骨架，避免贴图到达前后的几何跳变或异常比例。
export function SkinThumb({ src, alt, className }: SkinThumbProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={cn("bg-bg relative aspect-[16/9] w-full overflow-hidden rounded-md", className)}
    >
      {!loaded && !failed && <div className="bg-surface-raised absolute inset-0 animate-pulse" />}
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element -- 纹理来自后端对象存储，尺寸不固定，next/image 需远程 loader 配置
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-contain [image-rendering:pixelated]",
            !loaded && "opacity-0",
          )}
        />
      )}
    </div>
  );
}
