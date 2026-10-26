import { useTranslations } from "next-intl";
import { XIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface FacetChipsProps {
  loaders: string[];
  gameVersions: string[];
  selectedLoaders: string[];
  selectedVersions: string[];
  query: Record<string, string>;
}

// mods 搜索 facets：chips 为服务端渲染的链接（RSC，无客户端状态），
// 选中态经 URL 表达，可分享/可回退。
export function FacetChips({
  loaders,
  gameVersions,
  selectedLoaders,
  selectedVersions,
  query,
}: FacetChipsProps) {
  const t = useTranslations("mods");
  if (loaders.length === 0 && gameVersions.length === 0) return null;

  const toggle = (kind: "loaders" | "game_versions", value: string) => {
    const current = kind === "loaders" ? selectedLoaders : selectedVersions;
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    const q = { ...query };
    delete q.page;
    if (next.length > 0) q[kind === "loaders" ? "loaders" : "gv"] = next.join(",");
    else delete q[kind === "loaders" ? "loaders" : "gv"];
    return { pathname: "/mods" as const, query: q };
  };

  const chip = (kind: "loaders" | "game_versions", value: string, selected: boolean) => (
    <Link
      key={`${kind}-${value}`}
      href={toggle(kind, value)}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-text-muted hover:bg-surface hover:text-text",
      )}
    >
      {value}
      {selected && <XIcon className="ml-1 inline size-3" />}
    </Link>
  );

  return (
    <div className="mt-4 grid gap-3">
      {loaders.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-muted text-xs">{t("facetsLoaders")}</span>
          {loaders.slice(0, 10).map((l) => chip("loaders", l, selectedLoaders.includes(l)))}
        </div>
      )}
      {gameVersions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-muted text-xs">{t("facetsVersions")}</span>
          {gameVersions
            .slice(0, 12)
            .map((v) => chip("game_versions", v, selectedVersions.includes(v)))}
        </div>
      )}
    </div>
  );
}
