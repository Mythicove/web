import { SiteHeader } from "@/components/site-header";
import { CardGridSkeleton, Skeleton } from "@/components/skeleton";

interface ListPageSkeletonProps {
  // 与真实页面同构：mods 列表有副标题、skins 有排序按钮，骨架按同款结构占位
  subtitle?: boolean;
  sortButtons?: boolean;
}

export function ListPageSkeleton({ subtitle = false, sortButtons = false }: ListPageSkeletonProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12" aria-busy="true">
          <Skeleton className="h-8 w-40" />
          {subtitle && <Skeleton className="mt-2 h-4 w-72" />}
          <div className="mt-6 flex max-w-md gap-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-24" />
          </div>
          {sortButtons && (
            <div className="mt-2 flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
          )}
          <CardGridSkeleton />
        </div>
      </main>
    </div>
  );
}
