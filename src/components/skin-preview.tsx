"use client";

import { useEffect, useRef } from "react";
import { SkinViewer } from "skinview3d";

export function SkinPreview({ skinUrl }: { skinUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const viewer = new SkinViewer({ canvas, width: 280, height: 400 });
    viewer.autoRotate = true;
    viewer.loadSkin(skinUrl).catch(() => {});

    return () => viewer.dispose();
  }, [skinUrl]);

  return <canvas ref={canvasRef} className="rounded-lg" />;
}
