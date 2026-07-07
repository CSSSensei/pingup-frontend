"use client";

import { useMemo } from "react";

import { fitFrame } from "@/components/features/hall-map/frame";
import { TableShape, type TableStatus } from "@/components/features/hall-map/table-shape";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useVenueLayout } from "@/hooks/useHallMap";
import { overlaps, windowWithinHours } from "@/lib/hallSchedule";
import { moscowIso } from "@/lib/schemas/event";
import type { HallTable } from "@/types/api";

export function EventTablePicker({
  venueId,
  workingHours,
  date,
  start,
  end,
  value,
  onChange,
  excludeEventId,
}: {
  venueId: number;
  workingHours: Record<string, unknown> | null;
  date: string;
  start: string;
  end: string;
  value: number[];
  onChange: (ids: number[]) => void;
  excludeEventId?: number;
}) {
  const layoutQuery = useVenueLayout(venueId, date);
  const tables = useMemo(() => layoutQuery.data?.tables ?? [], [layoutQuery.data]);
  const frame = useMemo(() => fitFrame(tables, 2000, 1200), [tables]);

  const startMs = Date.parse(moscowIso(date, start));
  const endMs = Date.parse(moscowIso(date, end));

  function evalTable(t: HallTable): { status: TableStatus; selected: boolean; reason?: string } {
    const selected = value.includes(t.id);
    if (!t.is_active) return { status: "disabled", selected: false, reason: "Стол отключён" };
    if (!windowWithinHours(workingHours, t.schedule, date, start, end)) {
      return { status: "disabled", selected: false, reason: "Стол недоступен в это время" };
    }
    const others = t.bookings.filter((b) => b.event_id == null || b.event_id !== excludeEventId);
    if (overlaps(others, startMs, endMs) && !selected) {
      return { status: "booked", selected: false, reason: "Стол уже занят на это время" };
    }
    return { status: selected ? "edit" : "free", selected };
  }

  function toggle(id: number) {
    const t = tables.find((x) => x.id === id);
    if (!t) return;
    const { selected, reason } = evalTable(t);
    if (!selected && reason) {
      toast(reason);
      return;
    }
    onChange(selected ? value.filter((v) => v !== id) : [...value, id]);
  }

  if (layoutQuery.isPending) return <Skeleton className="h-56 w-full" />;
  if (tables.length === 0) {
    return <p className="text-sm font-semibold text-muted">В этом зале ещё нет схемы столов.</p>;
  }

  return (
    <div className="space-y-2">
      <div
        className="relative w-full overflow-hidden rounded-lg border border-border bg-surface-2"
        style={{ aspectRatio: `${frame.w}/${frame.h}` }}
      >
        <svg
          viewBox={`${frame.x} ${frame.y} ${frame.w} ${frame.h}`}
          className="h-full w-full select-none"
        >
          <defs>
            <pattern id="etp-floor" width={100} height={100} patternUnits="userSpaceOnUse">
              <circle cx={50} cy={50} r={2.4} fill="var(--color-border-strong)" />
            </pattern>
          </defs>
          <rect
            x={frame.x}
            y={frame.y}
            width={frame.w}
            height={frame.h}
            fill="url(#etp-floor)"
            pointerEvents="none"
          />
          {tables.map((t) => {
            const { status, selected } = evalTable(t);
            return (
              <TableShape
                key={t.id}
                tableKey={String(t.id)}
                label={t.label}
                x={t.x}
                y={t.y}
                rotation={t.rotation}
                status={status}
                selected={selected}
                onClick={(_, key) => toggle(Number(key))}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs font-semibold text-muted">
        <span>
          {value.length > 0
            ? `Выбрано столов: ${value.length}`
            : "Нажмите на столы, чтобы забронировать их за событием"}
        </span>
        <span className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" />
            Выбран
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-status-open" />
            Свободен
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-status-full" />
            Занят
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full border border-border-strong bg-surface-3" />
            Недоступен
          </span>
        </span>
      </div>
    </div>
  );
}
