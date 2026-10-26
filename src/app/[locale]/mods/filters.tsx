"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { SearchIcon } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 搜索走 URL（RSC 服务端取数），提交制而非逐键请求，天然无竞态。
export function ModFilters({ q }: { q: string }) {
  const t = useTranslations("mods");
  const router = useRouter();
  const [value, setValue] = useState(q);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const query: Record<string, string> = {};
    if (value.trim()) query.q = value.trim();
    router.push({ pathname: "/mods", query });
  };

  return (
    <form onSubmit={submit} className="mt-6 flex max-w-md gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("search")}
      />
      <Button type="submit" variant="outline">
        <SearchIcon />
        {t("search")}
      </Button>
    </form>
  );
}
