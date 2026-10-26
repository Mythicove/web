"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ScrollTextIcon, SearchIcon } from "lucide-react";
import { apiClient, type AuditEntry } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { PageSkeleton } from "@/components/skeleton";
import { AdminPager } from "./pager";

const LIMIT = 50;

export function AuditPanel({ token }: { token: string | null }) {
  const t = useTranslations("admin");
  const errText = useErrorText();
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    if (token === null) return;
    apiClient.admin
      .audit(token, query, (page - 1) * LIMIT, LIMIT)
      .then((r) => {
        setEntries(r.entries);
        setTotal(r.total);
      })
      .catch((e) => {
        toast.error(errText(e));
        setEntries([]);
      });
  }, [token, query, page, errText]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(q.trim());
  };

  if (token === null) return <p className="text-text-muted text-sm">{t("needToken")}</p>;

  return (
    <div className="grid gap-3">
      <form onSubmit={submit} className="flex max-w-md gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("auditSearchPlaceholder")}
          aria-label={t("colAction")}
        />
        <Button type="submit" variant="outline">
          <SearchIcon />
          {t("search")}
        </Button>
      </form>
      {entries === null ? (
        <PageSkeleton />
      ) : entries.length === 0 ? (
        <EmptyState icon={ScrollTextIcon} title={t("auditEmpty")} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("colTime")}</TableHead>
              <TableHead>{t("colActor")}</TableHead>
              <TableHead>{t("colAction")}</TableHead>
              <TableHead>{t("colTarget")}</TableHead>
              <TableHead>{t("colIP")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-text-muted text-xs whitespace-nowrap">
                  {new Date(e.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-xs">{e.actor}</TableCell>
                <TableCell className="text-xs font-medium">{e.action}</TableCell>
                <TableCell className="text-xs">
                  {e.target}
                  {e.detail && <span className="text-text-muted"> · {e.detail}</span>}
                </TableCell>
                <TableCell className="text-text-muted text-xs">{e.actor_ip}</TableCell>
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
    </div>
  );
}
