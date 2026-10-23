"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiClient, type SkinLibItem } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/site-header";
import { SkinPreview } from "@/components/skin-preview";

export default function SkinDetailPage() {
  const t = useTranslations("skinDetail");
  const params = useParams<{ id: string }>();
  const { auth } = useAuth();
  const [item, setItem] = useState<SkinLibItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    apiClient
      .listSkinLib(0, 1000)
      .then((items) => {
        const found = items.find((i) => i.id === params.id);
        if (found) setItem(found);
        else setError(t("notFound"));
      })
      .catch((e) => setError(String(e)));
  }, [params.id, t]);

  const like = async () => {
    if (!item || liked) return;
    try {
      await apiClient.likeSkin(item.id);
      setItem({ ...item, likes: item.likes + 1 });
      setLiked(true);
    } catch (e) {
      setError(String(e));
    }
  };

  const submitComment = async () => {
    if (!item || !auth?.accessToken || !comment.trim()) return;
    try {
      await apiClient.commentSkin(item.id, comment, auth.accessToken);
      setComment("");
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-12">
          {error && <p className="text-sm text-danger">{error}</p>}
          {!error && !item && <p className="text-sm text-text-muted">{t("loading")}</p>}
          {item && (
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="h-fit bg-surface">
                <CardContent className="flex justify-center py-10">
                  <SkinPreview skinUrl={apiClient.skinTextureUrl(item.texture_key)} />
                </CardContent>
              </Card>
              <Card className="bg-surface">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display">{item.player_name}</CardTitle>
                    <Badge variant="secondary">{item.model}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-text-muted">{item.description || t("noDesc")}</p>
                  <div className="flex items-center gap-4">
                    <Button onClick={like} disabled={liked}>
                      {liked ? t("liked") : t("like")} ({item.likes})
                    </Button>
                    <a
                      className="text-highlight hover:underline"
                      href={apiClient.skinTextureUrl(item.texture_key)}
                      download
                    >
                      {t("download")}
                    </a>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-sm text-text-muted">{t("commentHint")}</p>
                    <div className="mt-2 flex gap-2">
                      <Input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t("comment")}
                      />
                      <Button variant="outline" onClick={submitComment}>
                        {t("submit")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
