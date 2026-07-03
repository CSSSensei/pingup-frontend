"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DeleteRestoreControls } from "@/components/features/admin/delete-restore-controls";
import { Pager } from "@/components/features/admin/admin-venues-view";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { IconCalendar, IconExternalLink } from "@/components/ui/icons";
import { useAdminEventActions, useAdminEvents } from "@/hooks/useAdmin";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import {
  EVENT_STATUSES,
  EVENT_STATUS_LABELS,
  EVENT_TYPES,
  EVENT_TYPE_LABELS,
  type EventStatus,
  type EventType,
} from "@/lib/enums";
import { formatDateTime } from "@/lib/format";
import type { AdminEventFilterParams, EventRead } from "@/types/api";

const LIMIT = 30;
type Visibility = "" | "public" | "hidden";
// Тип "tournament" — только для объявлений напарников, события его не имеют.
const EVENT_TYPE_OPTIONS = EVENT_TYPES.filter((t) => t !== "tournament");

export function AdminEventsView() {
  const [type, setType] = useState<EventType | "">("");
  const [status, setStatus] = useState<EventStatus | "">("");
  const [visibility, setVisibility] = useState<Visibility>("");
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

  const filter: AdminEventFilterParams = {
    city_id: SMOLENSK_CITY_ID,
    ...(q ? { q } : {}),
    ...(type ? { event_type: type } : {}),
    ...(status ? { status } : {}),
    ...(visibility === "public" ? { is_public: true } : {}),
    ...(visibility === "hidden" ? { is_public: false } : {}),
    ...(includeDeleted ? { include_deleted: true } : {}),
    limit: LIMIT,
    offset,
  };

  const query = useAdminEvents(filter);
  const actions = useAdminEventActions();
  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const reset = () => setOffset(0);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <PageHeader title="События" description="Модерация игр и тренировок" />

      <div className="mb-5 space-y-3">
        <Input
          placeholder="Поиск по названию"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            className="max-w-[190px]"
            aria-label="Тип"
            value={type}
            onChange={(e) => {
              setType(e.target.value as EventType | "");
              reset();
            }}
          >
            <option value="">Все типы</option>
            {EVENT_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {EVENT_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
          <Select
            className="max-w-[190px]"
            aria-label="Статус"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as EventStatus | "");
              reset();
            }}
          >
            <option value="">Все статусы</option>
            {EVENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {EVENT_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select
            className="max-w-[170px]"
            aria-label="Видимость"
            value={visibility}
            onChange={(e) => {
              setVisibility(e.target.value as Visibility);
              reset();
            }}
          >
            <option value="">Любая видимость</option>
            <option value="public">Публичные</option>
            <option value="hidden">Скрытые</option>
          </Select>
          <label className="flex items-center gap-2 text-sm font-semibold text-fg-2">
            <Switch
              checked={includeDeleted}
              onCheckedChange={(v) => {
                setIncludeDeleted(v);
                reset();
              }}
            />
            Удалённые
          </label>
        </div>
      </div>

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon={<IconCalendar size={32} />} title="Событий нет" />
      ) : (
        <>
          <div className="space-y-2.5">
            {items.map((e) => (
              <EventRow key={e.id} event={e} actions={actions} />
            ))}
          </div>
          <Pager offset={offset} total={total} onChange={setOffset} limit={LIMIT} />
        </>
      )}
    </div>
  );
}

function EventRow({
  event,
  actions,
}: {
  event: EventRead;
  actions: ReturnType<typeof useAdminEventActions>;
}) {
  const deleted = event.deleted_at != null;
  const busy =
    (actions.update.isPending && actions.update.variables?.id === event.id) ||
    (actions.remove.isPending && actions.remove.variables?.id === event.id) ||
    (actions.restore.isPending && actions.restore.variables === event.id);

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-bold text-fg">{event.title}</p>
            <StatusBadge status={event.status} />
            {!event.is_public && (
              <Badge className="bg-surface-3 text-fg-2">Скрыто</Badge>
            )}
            {deleted && (
              <Badge className="bg-status-cancelled/12 text-status-cancelled">Удалено</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {EVENT_TYPE_LABELS[event.event_type]} · {formatDateTime(event.starts_at)} · #{event.id}
          </p>
        </div>
        <Link
          href={`/games/${event.id}`}
          className="flex-none text-muted hover:text-fg"
          aria-label="Открыть событие"
        >
          <IconExternalLink size={16} />
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {!deleted && (
          <>
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() =>
                actions.update.mutate(
                  { id: event.id, body: { is_public: !event.is_public } },
                  {
                    onSuccess: () =>
                      toast.success(event.is_public ? "Событие скрыто" : "Событие показано"),
                  },
                )
              }
            >
              {event.is_public ? "Скрыть" : "Показать"}
            </Button>
            <Select
              className="h-8 max-w-[170px] py-0 text-xs"
              aria-label="Изменить статус"
              value={event.status}
              disabled={busy}
              onChange={(e) =>
                actions.update.mutate(
                  { id: event.id, body: { status: e.target.value as EventStatus } },
                  { onSuccess: () => toast.success("Статус обновлён") },
                )
              }
            >
              {EVENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {EVENT_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </>
        )}
        <DeleteRestoreControls
          deleted={deleted}
          entity="событие"
          busy={busy}
          onSoftDelete={() =>
            actions.remove.mutate(
              { id: event.id },
              { onSuccess: () => toast.success("Событие удалено") },
            )
          }
          onHardDelete={() =>
            actions.remove.mutate(
              { id: event.id, hard: true },
              { onSuccess: () => toast.success("Событие удалено навсегда") },
            )
          }
          onRestore={() =>
            actions.restore.mutate(event.id, {
              onSuccess: () => toast.success("Событие восстановлено"),
            })
          }
        />
      </div>
    </div>
  );
}
