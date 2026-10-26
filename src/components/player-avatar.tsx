import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

// 玩家头像：mirror 按名字动态渲染贴图面部（/avatars/by-name），像素风保持 nearest 采样。
export function PlayerAvatar({ name, size = 32, className }: PlayerAvatarProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 头像为后端动态渲染 PNG，尺寸随参数变化
    <img
      src={apiClient.avatarByNameUrl(name, size)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      style={{ width: size, height: size }}
      className={cn("bg-surface-raised rounded-md [image-rendering:pixelated]", className)}
    />
  );
}
