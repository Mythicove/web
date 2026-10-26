"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImagesIcon, Trash2Icon } from "lucide-react";
import { apiClient, type SkinLibItem } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { PageSkeleton } from "@/components/skeleton";
import { AdminPager } from "./pager";
import { FilterRow } from "./filter-row";

const SKIN_FILTERS = ["under_review", "listed", "unlisted", ""] as const;
const LIMIT = 20;

export function ModerationPanel({ token }: { token: string | null }) {
  const t = useTranslations("admin");
  const errText = useErrorText();
  const [status, setStatus] = useState<string>("under_review");
  const [items, setItems] = useState<SkinLibItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const load = useCallback(() => {
    if (token === null) return;
    apiClient.admin
      .skins(token, status, (page - 1) * LIMIT, LIMIT)
      .then((r) => {
        setItems(r.items);
        setTotal(r.total);
      })
      .catch((e) => {
        toast.error(errText(e));
        setItems([]);
      });
  }, [token, status, page, errText]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatusAction = async (id: string, next: "listed" | "unlisted" | "under_review") => {
    if (token === null) return;
    try {
      await apiClient.admin.setSkinStatus(token, id, next);
      toast.success(t("saved"));
      load();
    } catch (e) {
      toast.error(errText(e));
    }
  };

  const remove = async () => {
    if (!pendingDelete || token === null) return;
    try {
      await apiClient.admin.deleteSkinLib(token, pendingDelete);
      toast.success(t("deleted"));
      load();
    } catch (e) {
      toast.error(errText(e));
    }
  };

  if (token === null) return <p className="text-text-muted text-sm">{t("needToken")}</p>;

  const filterLabel = (v: string) =>
    v === ""
      ? t("colStatus")
      : v === "under_review"
        ? t("statusUnderReview")
        : v === "listed"
          ? t("statusListed")
          : t("statusUnlisted");

  return (
    <div>
      <FilterRow
        options={SKIN_FILTERS}
        value={status}
        onChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        label={filterLabel}
      />
      {items === null ? (
        <PageSkeleton />
      ) : items.length === 0 ? (
        <EmptyState icon={ImagesIcon} title={t("moderationEmpty")} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("colTime")}</TableHead>
              <TableHead>{t("colUser")}</TableHead>
              <TableHead>{t("colReason")}</TableHead>
              <TableHead>{t("colStatus")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((it) => (
              <TableRow key={it.id}>
                <TableCell className="text-text-muted text-xs whitespace-nowrap">
                  {new Date(it.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-xs">{it.player_name}</TableCell>
                <TableCell className="max-w-[24rem] truncate text-xs" title={it.description}>
                  {it.description || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={it.status === "listed" ? "secondary" : "default"}>
                    {it.status === "listed"
                      ? t("statusListed")
                      : it.status === "under_review"
                        ? t("statusUnderReview")
                        : t("statusUnlisted")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    {it.status !== "listed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void setStatusAction(it.id, "listed")}
                      >
                        {t("approve")}
                      </Button>
                    )}
                    {it.status === "listed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void setStatusAction(it.id, "unlisted")}
                      >
                        {t("unlist")}
                      </Button>
                    )}
                    {it.status === "unlisted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void setStatusAction(it.id, "under_review")}
                      >
                        {t("requeue")}
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => setPendingDelete(it.id)}>
                      <Trash2Icon />
                      {t("delete")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <AdminPager
        page={page}
        pages={Math.max(1, Math.ceil(total / LIMIT))}
        onPage={setPage}
        label={t("pageLabel")}
      />
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={t("delete")}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
