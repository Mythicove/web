"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FlagIcon, Trash2Icon, XIcon } from "lucide-react";
import { apiClient, ApiError, type Report } from "@/lib/api";
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

const REPORT_FILTERS = ["pending", "dismissed", "acted", ""] as const;
const LIMIT = 20;

export function ReportsPanel({ token }: { token: string | null }) {
  const t = useTranslations("admin");
  const errText = useErrorText();
  const [status, setStatus] = useState<string>("pending");
  const [reports, setReports] = useState<Report[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pendingAct, setPendingAct] = useState<Report | null>(null);

  const load = useCallback(() => {
    if (token === null) return;
    apiClient.admin
      .reports(token, status, (page - 1) * LIMIT, LIMIT)
      .then((r) => {
        setReports(r.reports);
        setTotal(r.total);
      })
      .catch((e) => {
        toast.error(errText(e));
        setReports([]);
      });
  }, [token, status, page, errText]);

  useEffect(() => {
    load();
  }, [load]);

  const dismiss = async (id: string) => {
    if (token === null) return;
    try {
      await apiClient.admin.resolveReport(token, id, "dismissed");
      toast.success(t("saved"));
      load();
    } catch (e) {
      toast.error(errText(e));
    }
  };

  const removeAndClose = async () => {
    const rep = pendingAct;
    if (!rep || token === null) return;
    try {
      try {
        if (rep.target_type === "skin") {
          await apiClient.admin.deleteSkinLib(token, rep.target_id);
        } else {
          await apiClient.admin.deleteComment(token, rep.target_id);
        }
      } catch (e) {
        // 目标可能已被删除：404 时仍继续结案
        if (!(e instanceof ApiError && e.status === 404)) throw e;
      }
      await apiClient.admin.resolveReport(token, rep.id, "acted");
      toast.success(t("saved"));
      load();
    } catch (e) {
      toast.error(errText(e));
    }
  };

  if (token === null) return <p className="text-text-muted text-sm">{t("needToken")}</p>;

  const filterLabel = (v: string) =>
    v === ""
      ? t("colStatus")
      : v === "pending"
        ? t("statusUnderReview")
        : v === "dismissed"
          ? t("dismiss")
          : t("acted");

  return (
    <div>
      <FilterRow
        options={REPORT_FILTERS}
        value={status}
        onChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        label={filterLabel}
      />
      {reports === null ? (
        <PageSkeleton />
      ) : reports.length === 0 ? (
        <EmptyState icon={FlagIcon} title={t("reportsEmpty")} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("colTime")}</TableHead>
              <TableHead>{t("colReporter")}</TableHead>
              <TableHead>{t("colType")}</TableHead>
              <TableHead>{t("colReason")}</TableHead>
              <TableHead>{t("colStatus")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-text-muted text-xs whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-xs">{r.reporter_name || r.reporter_user_id}</TableCell>
                <TableCell className="text-xs">
                  {r.target_type === "skin" ? t("typeSkin") : t("typeComment")}
                </TableCell>
                <TableCell className="max-w-[24rem] truncate text-xs" title={r.reason}>
                  {r.reason || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={r.status === "pending" ? "default" : "secondary"}>
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {r.status === "pending" && (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => void dismiss(r.id)}>
                        <XIcon />
                        {t("dismiss")}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setPendingAct(r)}>
                        <Trash2Icon />
                        {t("removeContent")}
                      </Button>
                    </div>
                  )}
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
        open={pendingAct !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAct(null);
        }}
        title={t("removeContent")}
        onConfirm={() => void removeAndClose()}
      />
    </div>
  );
}
