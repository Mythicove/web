"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { islesRequest, type IslesServer } from "@/lib/isles";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function ServerNavLink({ menu = false }: { menu?: boolean }) {
  const t = useTranslations("isles");
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void islesRequest<IslesServer[]>("servers", { signal: controller.signal })
      .then((servers) => setAvailable(servers.length > 0))
      .catch(() => {});
    return () => controller.abort();
  }, []);
  if (!available) return null;
  if (menu)
    return <DropdownMenuItem render={<Link href="/servers" />}>{t("title")}</DropdownMenuItem>;
  return (
    <Link href="/servers" className="text-text-muted hover:text-text rounded-md px-3 py-2 text-sm">
      {t("title")}
    </Link>
  );
}
