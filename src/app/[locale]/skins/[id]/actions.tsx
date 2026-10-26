"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckIcon, DownloadIcon, FlagIcon, HeartIcon, Loader2Icon, SendIcon } from "lucide-react";
import { apiClient, type SkinLibItem } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useErrorText } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SkinActions({ item }: { item: SkinLibItem }) {
  const t = useTranslations("skinDetail");
  const errText = useErrorText();
  const router = useRouter();
  const { auth, isAuthenticated } = useAuth();
  const [likes, setLikes] = useState(item.likes);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingBusy, setReportingBusy] = useState(false);
  const [reported, setReported] = useState(false);

  const like = async () => {
    if (liked || liking) return;
    setLiking(true);
    setError(null);
    try {
      await apiClient.likeSkin(item.id);
      setLikes((n) => n + 1);
      setLiked(true);
    } catch (e) {
      setError(errText(e));
    } finally {
      setLiking(false);
    }
  };

  const apply = async () => {
    if (applying || applied || !isAuthenticated || !auth?.playerName) return;
    setApplying(true);
    setError(null);
    try {
      await apiClient.applySkin(item.id, auth.playerName);
      setApplied(true);
      router.refresh();
    } catch (e) {
      setError(errText(e));
    } finally {
      setApplying(false);
    }
  };

  const submitReport = async () => {
    if (reportingBusy) return;
    setReportingBusy(true);
    setError(null);
    try {
      await apiClient.report("skin", item.id, reportReason);
      setReported(true);
      setReporting(false);
    } catch (e) {
      setError(errText(e));
    } finally {
      setReportingBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void like()} disabled={liked || liking}>
          {liking ? <Loader2Icon className="animate-spin" /> : <HeartIcon />}
          {liked ? t("liked") : t("like")} ({likes})
        </Button>
        {isAuthenticated && auth?.playerName ? (
          <Button variant="outline" onClick={() => void apply()} disabled={applied || applying}>
            {applying ? <Loader2Icon className="animate-spin" /> : <CheckIcon />}
            {applied ? t("applyOk", { player: auth.playerName }) : t("apply")}
          </Button>
        ) : (
          <span className="text-text-muted text-xs">{t("applyNeedLogin")}</span>
        )}
        <Button
          render={<a href={apiClient.skinTextureUrl(item.texture_key)} download />}
          variant="ghost"
        >
          <DownloadIcon />
          {t("download")}
        </Button>
        {isAuthenticated && !reported && (
          <Button variant="outline" onClick={() => setReporting((v) => !v)}>
            <FlagIcon />
            {t("report")}
          </Button>
        )}
        {reported && (
          <span className="text-success flex items-center gap-1.5 text-xs">
            <CheckIcon className="size-3.5" />
            {t("reportOk")}
          </span>
        )}
      </div>
      {reporting && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void submitReport();
          }}
        >
          <Input
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder={t("reportReason")}
            maxLength={1000}
            aria-label={t("reportReason")}
          />
          <Button type="submit" variant="outline" disabled={reportingBusy}>
            {reportingBusy && <Loader2Icon className="animate-spin" />}
            {t("reportSubmit")}
          </Button>
        </form>
      )}
      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

export function SkinCommentBox({ itemId }: { itemId: string }) {
  const t = useTranslations("skinDetail");
  const errText = useErrorText();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy || !isAuthenticated || !comment.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await apiClient.commentSkin(itemId, comment);
      setComment("");
      router.refresh();
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthenticated) {
    return <p className="text-text-muted mt-4 text-sm">{t("commentHint")}</p>;
  }
  return (
    <form
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <div className="flex gap-2">
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("comment")}
          aria-label={t("comment")}
          required
          maxLength={500}
        />
        <Button type="submit" variant="outline" disabled={busy || !comment.trim()}>
          {busy ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
          {t("submit")}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-danger mt-2 text-sm">
          {error}
        </p>
      )}
    </form>
  );
}
