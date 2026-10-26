import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

interface PaginationProps {
  page: number;
  totalPages: number;
  href: (page: number) => { pathname: "/skins" | "/mods"; query: Record<string, string> };
  labels: { prev: string; next: string; aria: string };
}

// 页码窗口：1 … 4 5 6 … 20 形态，避免长列表铺满页码。
function pageWindow(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  if (page > 3) out.push("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) out.push(i);
  if (page < total - 2) out.push("…");
  out.push(total);
  return out;
}

export function Pagination({ page, totalPages, href, labels }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav className="flex items-center gap-1" aria-label={labels.aria}>
      {page > 1 && (
        <Button
          size="sm"
          variant="outline"
          render={<Link href={href(page - 1)} />}
          aria-label={labels.prev}
        >
          <ChevronLeftIcon />
        </Button>
      )}
      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="text-text-muted px-1 text-sm">
            …
          </span>
        ) : (
          <Button
            key={p}
            size="sm"
            variant={p === page ? "default" : "outline"}
            render={<Link href={href(p)} />}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Button>
        ),
      )}
      {page < totalPages && (
        <Button
          size="sm"
          variant="outline"
          render={<Link href={href(page + 1)} />}
          aria-label={labels.next}
        >
          <ChevronRightIcon />
        </Button>
      )}
    </nav>
  );
}
