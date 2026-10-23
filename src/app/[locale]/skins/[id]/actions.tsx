"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiClient, type SkinLibItem } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SkinActions({ item }: { item: SkinLibItem }) {
  const t = useTranslations("skinDetail");
  const router = useRouter();
  const { auth } = useAuth();
  const [likes, setLikes] = useState(item.likes);
  const [liked, setLiked] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const like = async () => {
    if (liked) return;
    try {
      await apiClient.likeSkin(item.id);
      setLikes((n) => n + 1);
      setLiked(true);
    } catch (e) {
      setError(String(e));
    }
  };

  const apply = async () => {
    setError(null);
    if (!auth?.accessToken || !auth.playerName) return;
    try {
      await apiClient.applySkin(item.id, auth.playerName, auth.accessToken);
      setApplied(true);
      router.refresh();
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={like} disabled={liked}>
          {liked ? t("liked") : t("like")} ({likes})
        </Button>
        {auth?.accessToken && auth.playerName ? (
          <Button variant="outline" onClick={apply} disabled={applied}>
            {applied ? t("applyOk", { player: auth.playerName }) : t("apply")}
          </Button>
        ) : (
          <span className="text-xs text-text-muted">{t("applyNeedLogin")}</span>
        )}
        <a
          className="text-highlight hover:underline"
          href={apiClient.skinTextureUrl(item.texture_key)}
          download
        >
          {t("download")}
        </a>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

export function SkinCommentBox({ itemId }: { itemId: string }) {
  const t = useTranslations("skinDetail");
  const router = useRouter();
  const { auth } = useAuth();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!auth?.accessToken || !comment.trim()) return;
    try {
      await apiClient.commentSkin(itemId, comment, auth.accessToken);
      setComment("");
      router.refresh();
    } catch (e) {
      setError(String(e));
    }
  };

  if (!auth?.accessToken) {
    return <p className="mt-4 text-sm text-text-muted">{t("commentHint")}</p>;
  }
  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("comment")}
        />
        <Button variant="outline" onClick={submit}>
          {t("submit")}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
