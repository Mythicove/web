"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { apiClient, type SkinLibItem } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";

export default function SkinsPage() {
  const t = useTranslations("auth");
  const [items, setItems] = useState<SkinLibItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .listSkinLib()
      .then(setItems)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h1 className="font-display text-2xl font-semibold">{t("skinsTitle")}</h1>
          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
          {!error && items.length === 0 && (
            <p className="mt-4 text-sm text-text-muted">{t("empty")}</p>
          )}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="bg-surface">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-medium">{item.player_name}</span>
                    <Badge variant="secondary">{item.model}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-text-muted">
                    {item.description || t("noDesc")}
                  </p>
                  <div className="mt-4 text-xs text-text-muted">{item.likes} likes</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
