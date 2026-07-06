"use client";

import { useState } from "react";

import { Pager } from "@/components/features/admin/admin-venues-view";
import { EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { UserRoleBadge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { IconClock } from "@/components/ui/icons";
import { useAuditLog } from "@/hooks/useAdmin";
import { formatDateTime } from "@/lib/format";
import type { AuditLogRead } from "@/types/api";

const LIMIT = 40;

const ACTION_LABELS: Record<string, string> = {
  "user.ban": "Бан игрока",
  "user.unban": "Разбан игрока",
  "user.role_change": "Смена роли",
  "user.superuser_change": "Смена superuser",
  "user.delete": "Удаление пользователя",
  "venue.create": "Создание зала",
  "venue.update": "Редактирование зала",
  "venue.delete": "Удаление зала",
  "venue.restore": "Восстановление зала",
  "venue.verify": "Верификация зала",
  "venue.layout_update": "Схема столов",
  "venue.staff_add": "Назначен персонал зала",
  "venue.staff_remove": "Снят персонал зала",
  "event.hide": "Скрытие события",
  "event.update": "Редактирование события",
  "event.delete": "Удаление события",
  "event.restore": "Восстановление события",
  "tournament.create": "Создание турнира",
  "tournament.update": "Редактирование турнира",
  "tournament.delete": "Удаление турнира",
  "tournament.participant_update": "Участник турнира",
  "review.hide": "Скрытие отзыва",
  "review.update": "Редактирование отзыва",
  "review.delete": "Удаление отзыва",
  "report.resolve": "Разбор жалобы",
  "booking.cancel": "Отмена брони",
  "rating_sync.run": "Синк рейтинга",
  "rating_sync.run_all": "Синк всех рейтингов",
};

const actionLabel = (action: string) => ACTION_LABELS[action] ?? action;

export function AdminAuditView() {
  const [action, setAction] = useState("");
  const [offset, setOffset] = useState(0);
  const query = useAuditLog({ ...(action ? { action } : {}), limit: LIMIT, offset });
  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <PageHeader title="Аудит-журнал" description="Кто, что и когда изменил" />

      <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-fg-2">Действия</h2>
          <Select
            className="h-8 max-w-[220px] py-0 text-xs"
            aria-label="Тип действия"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setOffset(0);
            }}
          >
            <option value="">Все действия</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {query.isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState icon={<IconClock size={30} />} title="Записей нет" />
        ) : (
          <>
            <div className="divide-y divide-border">
              {items.map((log) => (
                <AuditRow key={log.id} log={log} />
              ))}
            </div>
            <Pager offset={offset} total={total} onChange={setOffset} limit={LIMIT} />
          </>
        )}
      </section>
    </div>
  );
}

function AuditRow({ log }: { log: AuditLogRead }) {
  const target =
    log.target_type && log.target_id
      ? `${log.target_type} #${log.target_id}`
      : log.target_type || null;

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-fg">{actionLabel(log.action)}</span>
        <span className="flex-none text-xs text-muted">{formatDateTime(log.created_at)}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <UserRoleBadge role={log.actor_role} />
        <span>{log.actor_email ?? (log.actor_id ? `#${log.actor_id}` : "система")}</span>
        {target && <span>· {target}</span>}
      </div>
      {log.reason && <p className="mt-1 text-xs text-fg-2">Причина: {log.reason}</p>}
    </div>
  );
}
