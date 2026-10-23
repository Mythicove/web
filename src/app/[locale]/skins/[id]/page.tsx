import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { apiClient, type SkinComment } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SkinPreview } from "@/components/skin-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkinActions, SkinCommentBox } from "./actions";

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function SkinDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const t = await getTranslations("skinDetail");

  let item;
  try {
    item = await apiClient.getSkinLib(id);
  } catch {
    notFound();
  }
  let comments: SkinComment[] = [];
  try {
    comments = await apiClient.listComments(id);
  } catch {
    comments = [];
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
                {published && (
                  <p className="text-xs text-text-muted">{t("publishedAt", { date: published })}</p>
                )}
                <SkinActions item={item} />
              </CardContent>
            </Card>
          </div>

          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold">
              {t("commentsTitle")} ({comments.length})
            </h2>
            {comments.length === 0 ? (
              <p className="mt-3 text-sm text-text-muted">{t("noComments")}</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {comments.map((c) => (
                  <li key={c.id} className="rounded-lg border border-border bg-surface p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{c.author_name || "…"}</span>
                      <span className="text-xs text-text-muted">
                        {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                          new Date(c.created_at),
                        )}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{c.content}</p>
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
