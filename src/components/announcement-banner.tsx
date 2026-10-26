"use client";

import { useEffect, useState } from "react";
import { MegaphoneIcon, XIcon } from "lucide-react";
import { apiClient, type Announcement } from "@/lib/api";

const DISMISS_KEY = "mythicove:announcement-dismissed";

// 站点公告横幅：admin 后台设置，前台全站展示，可关闭（会话内记住）。
export function AnnouncementBanner() {
  const [a, setA] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY) === "1",
  );

  useEffect(() => {
    apiClient
      .announcement()
      .then(setA)
      .catch(() => setA(null));
  }, []);

  if (!a?.enabled || !a.title || dismissed) return null;
  return (
    <div className="border-border bg-surface-raised/60 border-b">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 md:px-6">
        <MegaphoneIcon className="text-highlight size-4 shrink-0" />
        <p className="min-w-0 flex-1 truncate text-sm">
          <span className="font-medium">{a.title}</span>
          {a.body && <span className="text-text-muted"> — {a.body}</span>}
        </p>
        <button
          type="button"
          aria-label="dismiss"
          className="text-text-muted hover:text-text"
          onClick={() => {
            sessionStorage.setItem(DISMISS_KEY, "1");
            setDismissed(true);
          }}
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
