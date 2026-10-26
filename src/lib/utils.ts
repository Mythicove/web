import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// clsx + tailwind-merge：冲突的 Tailwind 类以调用方传入的为准（如 Card 的 bg-card 被页面 bg-surface 覆盖）。
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
