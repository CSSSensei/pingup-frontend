"use client";

import { useEffect, useState } from "react";

import { AdminUserCard } from "@/components/features/admin/admin-user-card";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { IconUsers } from "@/components/ui/icons";
import { useAdminUsers } from "@/hooks/useAdmin";
import { USER_ROLES, USER_ROLE_LABELS } from "@/lib/enums";
import type { AdminUserFilterParams, UserRole } from "@/types/api";

const LIMIT = 30;
type StatusFilter = "" | "active" | "banned" | "unverified";

export function AdminUsersView() {
  const [role, setRole] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [offset, setOffset] = useState(0);

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setOffset(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const filter: AdminUserFilterParams = {
    ...(q ? { q } : {}),
    ...(role ? { role } : {}),
    ...(statusFilter === "active" ? { is_active: true } : {}),
    ...(statusFilter === "banned" ? { is_active: false } : {}),
    ...(statusFilter === "unverified" ? { is_email_verified: false } : {}),
    ...(includeDeleted ? { include_deleted: true } : {}),
    limit: LIMIT,
    offset,
  };

  const query = useAdminUsers(filter);
  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  const resetOffset = () => setOffset(0);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <PageHeader title="Пользователи" description="Управление аккаунтами и ролями" />

      <div className="mb-5 space-y-3">
        <Input
          placeholder="Поиск по имени или email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Select
            className="max-w-[190px]"
            aria-label="Роль"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as UserRole | "");
              resetOffset();
            }}
          >
            <option value="">Все роли</option>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {USER_ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
          <Select
            className="max-w-[190px]"
            aria-label="Статус"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              resetOffset();
            }}
          >
            <option value="">Любой статус</option>
            <option value="active">Активные</option>
            <option value="banned">Заблокированные</option>
            <option value="unverified">Email не подтверждён</option>
          </Select>
        </div>
        <label className="flex w-fit items-center gap-2 text-sm font-semibold text-fg-2">
          <Switch
            checked={includeDeleted}
            onCheckedChange={(v) => {
              setIncludeDeleted(v);
              resetOffset();
            }}
          />
          Показывать удалённых
        </label>
      </div>

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={32} />}
          title="Никого не нашли"
          description="Измените фильтры или поисковый запрос."
        />
      ) : (
        <>
          <div className="space-y-2.5">
            {items.map((u) => (
              <AdminUserCard key={u.id} user={u} />
            ))}
          </div>

          {total > LIMIT && (
            <div className="mt-5 flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              >
                Назад
              </Button>
              <span className="text-xs text-muted">
                {offset + 1}–{Math.min(offset + LIMIT, total)} из {total}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={offset + LIMIT >= total}
                onClick={() => setOffset(offset + LIMIT)}
              >
                Вперёд
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
