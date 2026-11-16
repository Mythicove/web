import { TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadFailedProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

// 配置/列表加载失败的统一形态：如实告知"请求失败（网络或后端不可用）"并给重试。
// 绝不把请求失败伪装成某种业务状态（如"已关闭某功能"），避免把人引向死路。
export function LoadFailed({ message, onRetry, retryLabel, className }: LoadFailedProps) {
  return (
    <div
      role="alert"
      className={cn(
        "border-border bg-surface/50 flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-8 text-center",
        className,
      )}
    >
      <TriangleAlertIcon className="text-warning size-7" aria-hidden="true" />
      <p className="text-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
