"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SkinFilters({ q, sort }: { q: string; sort: string }) {
  const t = useTranslations("skins");
  const router = useRouter();
  const [value, setValue] = useState(q);

  const push = (next: { q?: string; sort?: string }) => {
    const query: Record<string, string> = {};
    const nq = next.q !== undefined ? next.q : value;
    const nsort = next.sort !== undefined ? next.sort : sort;
    if (nq.trim()) query.q = nq.trim();
    if (nsort !== "newest") query.sort = nsort;
    router.push({ pathname: "/skins", query });
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <form
        className="flex flex-1 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          push({});
        }}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline">
          {t("search")}
        </Button>
      </form>
      <div className="flex gap-2">
        <Button
          variant={sort === "newest" ? "default" : "outline"}
          onClick={() => push({ sort: "newest" })}
        >
          {t("sortNewest")}
        </Button>
        <Button
          variant={sort === "likes" ? "default" : "outline"}
          onClick={() => push({ sort: "likes" })}
        >
          {t("sortLikes")}
        </Button>
      </div>
    </div>
  );
}
