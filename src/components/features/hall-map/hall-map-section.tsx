"use client";

import { useState } from "react";

import { HallMap } from "@/components/features/hall-map/hall-map";
import { ErrorState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { IconPencil } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useVenueLayout } from "@/hooks/useHallMap";
import { useMe } from "@/hooks/useMe";
import { MIN_BOOKING_MIN, availableStarts } from "@/lib/hallSchedule";
import { isoToMoscowDate } from "@/lib/schemas/event";
import { isModerator } from "@/lib/roles";
import type { VenueRead } from "@/types/api";

export function HallMapSection({ venue }: { venue: VenueRead }) {
  const { data: me } = useMe();
  const canEdit = isModerator(me?.role);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [today] = useState(() => isoToMoscowDate(new Date().toISOString()));
  const [date, setDate] = useState(today);

  const layoutQuery = useVenueLayout(venue.id, date);

  const dayClosed = availableStarts(venue.working_hours, date, MIN_BOOKING_MIN).length === 0;

  const tables = layoutQuery.data?.tables;
  if (!canEdit && tables && tables.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-fg">Схема зала</h2>
        {canEdit && mode === "view" && (
          <Button
            size="sm"
            variant="secondary"
            disabled={!tables}
            onClick={() => setMode("edit")}
          >
            <IconPencil size={15} />
            Редактировать
          </Button>
        )}
      </div>

      {layoutQuery.isPending ? (
        <Skeleton className="h-64 w-full sm:h-80" />
      ) : layoutQuery.isError ? (
        <ErrorState onRetry={() => layoutQuery.refetch()} />
      ) : (
        <div className="space-y-3">
          {mode === "view" && (
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="date"
                value={date}
                min={today}
                onChange={(e) => {
                  if (e.target.value && e.target.value >= today) setDate(e.target.value);
                }}
                className="w-auto"
              />
              {dayClosed && (
                <span className="text-sm font-semibold text-muted">
                  Зал в этот день не работает
                </span>
              )}
            </div>
          )}

          {mode === "view" && tables && tables.length === 0 && (
            <p className="text-sm font-semibold text-muted">
              Столы ещё не расставлены — нажмите «Редактировать», чтобы добавить их на схему.
            </p>
          )}
          {mode === "edit" && (
            <p className="text-[13px] font-semibold text-muted">
              Перетаскивайте столы (сетка 10 см), вращайте за маркер или кнопкой 90°. Delete
              удаляет выбранный стол.
            </p>
          )}

          <HallMap
            venueId={venue.id}
            venueSlug={venue.slug}
            workingHours={venue.working_hours}
            mode={mode}
            date={date}
            onExitEdit={() => setMode("view")}
          />

          {mode === "view" && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-status-open" />
                Есть свободное время — нажмите на стол
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-status-full" />
                Занят весь день
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full border border-border-strong bg-surface-3" />
                Недоступен
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
