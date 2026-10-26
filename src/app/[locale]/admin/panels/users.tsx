"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { SearchIcon, UsersIcon } from "lucide-react";
import { apiClient, type AdminUser } from "@/lib/api";
import { useErrorText } from "@/lib/errors";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { PageSkeleton } from "@/components/skeleton";
import { AdminPager } from "./pager";

const LIMIT = 20;

export function UsersPanel({ token }: { token: string | null }) {
  const t = useTranslations("admin");
  const errText = useErrorText();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    if (token === null) return;
    apiClient.admin
      .listUsers(token, query, (page - 1) * LIMIT, LIMIT)
      .then((r) => {
        setUsers(r.users);
        setTotal(r.total);
      })
      .catch((e) => {
        toast.error(errText(e));
        setUsers([]);
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

  const update = async (u: AdminUser, role: AdminUser["role"], status: AdminUser["status"]) => {
    if (token === null) return;
    try {
      await apiClient.admin.updateUser(token, u.id, role, status);
      setUsers((prev) => prev?.map((x) => (x.id === u.id ? { ...x, role, status } : x)) ?? null);
      toast.success(t("saved"));
    } catch (e) {
      toast.error(errText(e));
      load();
    }
  };

  if (token === null) return <p className="text-text-muted text-sm">{t("needToken")}</p>;

  return (
    <div className="grid gap-3">
      <form onSubmit={submit} className="flex max-w-md gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("userSearchPlaceholder")}
          aria-label={t("colUser")}
        />
        <Button type="submit" variant="outline">
          <SearchIcon />
          {t("search")}
        </Button>
      </form>
      {users === null ? (
        <PageSkeleton />
      ) : users.length === 0 ? (
        <EmptyState icon={UsersIcon} title={t("usersEmpty")} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("colUser")}</TableHead>
              <TableHead>{t("colPlayers")}</TableHead>
              <TableHead>{t("colRole")}</TableHead>
              <TableHead>{t("colStatus")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{u.nickname || u.email}</span>
                    {!u.verified && <Badge variant="secondary">{t("unverified")}</Badge>}
                  </div>
                  <div className="text-text-muted text-xs">{u.email}</div>
                </TableCell>
                <TableCell className="text-text-muted text-xs">
                  {u.player_names.join(", ")}
                </TableCell>
                <TableCell>
                  <Select
                    value={u.role}
                    onValueChange={(v) => update(u, v as AdminUser["role"], u.status)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">user</SelectItem>
                      <SelectItem value="admin">admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={u.status}
                    onValueChange={(v) => update(u, u.role, v as AdminUser["status"])}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="banned">banned</SelectItem>
                      <SelectItem value="suspended">suspended</SelectItem>
                    </SelectContent>
                  </Select>
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
    </div>
  );
}
