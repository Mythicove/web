import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}

// 空状态统一形态：真实图标 + 标题 + 一句引导 + 可选动作，不用通用插画。
export function EmptyState({ icon: Icon, title, hint, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border bg-surface/50 flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      <Icon className="text-text-muted size-8" aria-hidden="true" />
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="text-text-muted max-w-sm text-xs">{hint}</p>}
      {action}
    </div>
  );
}
