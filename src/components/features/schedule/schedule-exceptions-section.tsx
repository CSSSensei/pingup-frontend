"use client";

import { useState } from "react";

import { ScheduleExceptionModal } from "@/components/features/schedule/schedule-exception-modal";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { IconPlus, IconTrash } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useDeleteScheduleException, useVenueScheduleExceptions } from "@/hooks/useMyVenues";
import { useVenueLayout } from "@/hooks/useHallMap";
import { describeException, formatExcDateRange } from "@/lib/scheduleExceptions";
import { isoToMoscowDate } from "@/lib/schemas/event";
import type { ScheduleException } from "@/types/api";

export function ScheduleExceptionsSection({ venueId }: { venueId: number }) {
  const today = isoToMoscowDate(new Date().toISOString());
  const exceptions = useVenueScheduleExceptions(venueId);
  const layout = useVenueLayout(venueId, today);
  const [showModal, setShowModal] = useState(false);

  const tables = (layout.data?.tables ?? []).map((t) => ({ id: t.id, label: t.label }));
  const labelById = new Map(tables.map((t) => [t.id, t.label]));
  const items = exceptions.data ?? [];

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-fg-2">Расписание и блокировки</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowModal(true)}>
          <IconPlus size={15} />
          Добавить
        </Button>
      </div>

      {exceptions.isPending ? (
        <Skeleton className="h-14 w-full" />
      ) : items.length === 0 ? (
        <p className="py-1 text-sm text-muted">Ограничений нет — зал работает по расписанию.</p>
      ) : (
        <div className="divide-y divide-border">
          {items.map((exc) => (
            <ExceptionRow
              key={exc.id}
              venueId={venueId}
              exc={exc}
              tableLabel={exc.table_id != null ? labelById.get(exc.table_id) : undefined}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ScheduleExceptionModal
          venueId={venueId}
          tables={tables}
          today={today}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function ExceptionRow({
  venueId,
  exc,
  tableLabel,
}: {
  venueId: number;
  exc: ScheduleException;
  tableLabel?: string;
}) {
  const [confirm, setConfirm] = useState(false);
  const del = useDeleteScheduleException(venueId);

  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-fg">{describeException(exc, tableLabel)}</p>
        <p className="mt-0.5 text-xs text-muted">
          {formatExcDateRange(exc.date_from, exc.date_to)}
          {exc.reason ? ` · ${exc.reason}` : ""}
        </p>
      </div>
      <button
        type="button"
        aria-label="Удалить исключение"
        onClick={() => setConfirm(true)}
        className="flex-none text-muted hover:text-danger"
      >
        <IconTrash size={16} />
      </button>

      <ConfirmDialog
        open={confirm}
        title="Убрать исключение?"
        message="Расписание вернётся к обычному на эти даты."
        confirmLabel="Убрать"
        destructive
        loading={del.isPending}
        onConfirm={() =>
          del.mutate(exc.id, {
            onSuccess: () => {
              toast.success("Исключение удалено");
              setConfirm(false);
            },
          })
        }
        onClose={() => setConfirm(false)}
      />
    </div>
  );
}
