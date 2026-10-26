"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface AdminPagerProps {
  page: number;
  pages: number;
  onPage: (page: number) => void;
  label: string;
}

// 管理后台客户端分页器（数据经 token 拉取，不走 URL）。
export function AdminPager({ page, pages, onPage, label }: AdminPagerProps) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeftIcon />
      </Button>
      <span className="text-text-muted text-xs">
        {label} {page} / {pages}
      </span>
      <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
