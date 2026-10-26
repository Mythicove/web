import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("bg-surface-raised animate-pulse rounded-md", className)} />;
}

// 卡片网格骨架：与 skins/mods 列表的真实卡片同构，避免加载时布局跳动。
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-border bg-surface rounded-xl border p-5">
          <Skeleton className="aspect-[16/9] w-full" />
          <Skeleton className="mt-4 h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="grid gap-3" aria-hidden="true">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
