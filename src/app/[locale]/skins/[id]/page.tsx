import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MessageCircleIcon } from "lucide-react";
import { apiClient, ApiError, type SkinComment } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SkinPreview } from "@/components/skin-preview";
import { PlayerAvatar } from "@/components/player-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkinActions, SkinCommentBox } from "./actions";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  try {
    const item = await apiClient.getSkinLib(id);
    return {
      title: item.player_name,
      description: item.description,
      openGraph: {
        images: [
          {
            url: apiClient.avatarByNameUrl(item.player_name, 256),
            width: 256,
            height: 256,
            alt: item.player_name,
          },
        ],
      },
    };
  } catch {
    const t = await getTranslations({ locale, namespace: "nav" });
    return { title: t("skins") };
  }
}

export default async function SkinDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("skinDetail");

  let item;
  try {
    item = await apiClient.getSkinLib(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e; // 其余错误交给 skins/error.tsx 边界
  }
  let comments: SkinComment[] = [];
  try {
    comments = await apiClient.listComments(id);
  } catch {
    comments = []; // 评论属次要内容，失败降级为空列表
  }

  const published = item.created_at
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(item.created_at))
    : "";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="bg-surface h-fit">
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
                <p className="text-text-muted text-sm">{item.description || t("noDesc")}</p>
                {published && (
                  <p className="text-text-muted text-xs">{t("publishedAt", { date: published })}</p>
                )}
                <SkinActions item={item} />
              </CardContent>
            </Card>
          </div>

          <section className="mt-10">
            <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
              <MessageCircleIcon className="text-text-muted size-4" />
              {t("commentsTitle")} ({comments.length})
            </h2>
            {comments.length === 0 ? (
              <p className="text-text-muted mt-3 text-sm">{t("noComments")}</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {comments.map((c) => (
                  <li key={c.id} className="border-border bg-surface rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <PlayerAvatar name={c.author_name || "steve"} size={28} />
                        {c.author_name || "…"}
                      </span>
                      <span className="text-text-muted text-xs">
                        {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                          new Date(c.created_at),
                        )}
                      </span>
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{c.content}</p>
                  </li>
                ))}
              </ul>
            )}
            <SkinCommentBox itemId={item.id} />
          </section>
        </div>
      </main>
    </div>
  );
}
