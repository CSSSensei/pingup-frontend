"use client";

import Link from "next/link";
import { useState } from "react";

import { Pager } from "@/components/features/admin/admin-venues-view";
import { EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { IconActivity, IconRefresh } from "@/components/ui/icons";
import {
  useRatingSyncActions,
  useRatingSyncLog,
  useRatingSyncStale,
} from "@/hooks/useAdmin";
import { durationLabel, triggeredByLabel } from "@/lib/admin";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { ProfileMe, RatingSyncLogRead } from "@/types/api";

const LOG_LIMIT = 30;
const STALE_LIMIT = 10;

export function AdminRatingSyncView() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <PageHeader title="Синхронизация рейтинга" description="теннис67.рф → профили игроков" />
      <div className="space-y-4">
        <RunAllCard />
        <StaleCard />
        <LogCard />
      </div>
    </div>
  );
}

function RunAllCard() {
  const { runAll } = useRatingSyncActions();
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-fg-2">Синхронизировать всех</h2>
          <p className="mt-0.5 text-xs text-muted">
            Ставит в очередь синк всех привязанных профилей. Не чаще 2 раз в час.
          </p>
        </div>
        <Button
          size="sm"
          loading={runAll.isPending}
          onClick={() => setOpen(true)}
        >
          <IconRefresh size={16} /> Запустить
        </Button>
      </div>
      <ConfirmDialog
        open={open}
        title="Синхронизировать все профили?"
        message="Синк всех привязанных профилей будет поставлен в очередь. Лимит — 2 запуска в час."
        confirmLabel="Запустить"
        loading={runAll.isPending}
        onConfirm={() =>
          runAll.mutate(undefined, {
            onSuccess: (res) => {
              toast.success(`В очередь поставлено профилей: ${res.enqueued}`);
              setOpen(false);
            },
          })
        }
        onClose={() => setOpen(false)}
      />
    </section>
  );
}

function StaleCard() {
  const [offset, setOffset] = useState(0);
  const query = useRatingSyncStale({ limit: STALE_LIMIT, offset });
  const { run } = useRatingSyncActions();
  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <h2 className="text-sm font-bold text-fg-2">Устаревшие профили</h2>
      <p className="mt-0.5 mb-3 text-xs text-muted">Рейтинг давно не обновлялся</p>

      {query.isPending ? (
        <Skeleton className="h-24 w-full" />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <p className="py-3 text-sm text-muted">Устаревших профилей нет.</p>
      ) : (
        <>
          <div className="divide-y divide-border">
            {items.map((p) => (
              <StaleRow
                key={p.id}
                profile={p}
                busy={run.isPending && run.variables === p.id}
                onRun={() =>
                  run.mutate(p.id, { onSuccess: (res) => toast.success(res.detail) })
                }
              />
            ))}
          </div>
          <Pager offset={offset} total={total} onChange={setOffset} limit={STALE_LIMIT} />
        </>
      )}
    </section>
  );
}

function StaleRow({
  profile,
  onRun,
  busy,
}: {
  profile: ProfileMe;
  onRun: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        {profile.slug ? (
          <Link
            href={`/players/${profile.slug}`}
            className="truncate text-sm font-semibold text-fg hover:text-primary"
          >
            {profile.display_name}
          </Link>
        ) : (
          <span className="truncate text-sm font-semibold text-fg">{profile.display_name}</span>
        )}
        <p className="text-xs text-muted">
          Рейтинг: {profile.current_rating ?? "—"} ·{" "}
          {profile.rating_synced_at
            ? `синк ${formatRelative(profile.rating_synced_at)}`
            : "не синхронизировался"}
        </p>
      </div>
      <Button variant="secondary" size="sm" loading={busy} onClick={onRun}>
        Синк
      </Button>
    </div>
  );
}

type SuccessFilter = "" | "ok" | "fail";

function LogCard() {
  const [success, setSuccess] = useState<SuccessFilter>("");
  const [offset, setOffset] = useState(0);
  const query = useRatingSyncLog({
    ...(success === "ok" ? { success: true } : {}),
    ...(success === "fail" ? { success: false } : {}),
    limit: LOG_LIMIT,
    offset,
  });
  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-fg-2">Журнал синхронизаций</h2>
        <Select
          className="h-8 max-w-[150px] py-0 text-xs"
          aria-label="Результат"
          value={success}
          onChange={(e) => {
            setSuccess(e.target.value as SuccessFilter);
            setOffset(0);
          }}
        >
          <option value="">Все</option>
          <option value="ok">Успешные</option>
          <option value="fail">С ошибкой</option>
        </Select>
      </div>

      {query.isPending ? (
        <Skeleton className="h-40 w-full" />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon={<IconActivity size={30} />} title="Записей нет" />
      ) : (
        <>
          <div className="divide-y divide-border">
            {items.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>
          <Pager offset={offset} total={total} onChange={setOffset} limit={LOG_LIMIT} />
        </>
      )}
    </section>
  );
}

function LogRow({ log }: { log: RatingSyncLogRead }) {
  const delta =
    log.success && log.old_rating != null && log.new_rating != null
      ? log.new_rating - log.old_rating
      : null;

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {log.success ? (
            <Badge className="bg-status-confirmed/12 text-status-confirmed">OK</Badge>
          ) : (
            <Badge className="bg-status-declined/12 text-status-declined">Ошибка</Badge>
          )}
          <span className="text-sm font-semibold text-fg">Профиль #{log.profile_id}</span>
          <span className="text-xs text-muted">· {triggeredByLabel(log.triggered_by)}</span>
        </div>
        <span className="flex-none text-xs text-muted">{formatDateTime(log.created_at)}</span>
      </div>
      <p className="mt-1 text-xs text-muted">
        {log.success
          ? `${log.old_rating ?? "—"} → ${log.new_rating ?? "—"}${
              delta != null && delta !== 0 ? ` (${delta > 0 ? "+" : ""}${delta})` : ""
            } · ${durationLabel(log.duration_ms)}`
          : log.error_message || "Неизвестная ошибка"}
        {log.http_status ? ` · HTTP ${log.http_status}` : ""}
      </p>
    </div>
  );
}
