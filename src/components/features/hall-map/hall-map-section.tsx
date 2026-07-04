"use client";

import { useMemo, useState } from "react";

import { HallMap } from "@/components/features/hall-map/hall-map";
import { ErrorState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { IconPaddle, IconPencil, IconPlus } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BallSpinner } from "@/components/ui/spinner";
import { useVenueLayout } from "@/hooks/useHallMap";
import { useMe } from "@/hooks/useMe";
import { MIN_BOOKING_MIN, availableStarts, availableStartsForTable, hasFreeSlot } from "@/lib/hallSchedule";
import { isoToMoscowDate, moscowIso } from "@/lib/schemas/event";
import { isModerator } from "@/lib/roles";
import { cn } from "@/lib/utils";
import type { VenueRead } from "@/types/api";

const WEEKDAYS = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

// МСК фиксирован (+03:00, без переходов) — полдень МСК не пересекает границу суток.
function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00+03:00`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function dayPillLabel(dateStr: string, i: number): string {
  if (i === 0) return "Сегодня";
  if (i === 1) return "Завтра";
  const d = new Date(`${dateStr}T12:00:00+03:00`);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()}`;
}

export function HallMapSection({ venue }: { venue: VenueRead }) {
  const { data: me } = useMe();
  const canEdit = isModerator(me?.role);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [today] = useState(() => isoToMoscowDate(new Date().toISOString()));
  const [date, setDate] = useState(today);

  const layoutQuery = useVenueLayout(venue.id, date);
  const tables = layoutQuery.data?.tables;
  const hasMap = !!tables && tables.length > 0;
  // Показываем прошлый день, пока грузится новый (keepPreviousData) — дозагрузку помечаем dim'ом.
  const switchingDay = layoutQuery.isPlaceholderData && layoutQuery.isFetching;

  const dayPills = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(today, i)),
    [today],
  );

  const startMsList = useMemo(
    () =>
      availableStarts(venue.working_hours, date, MIN_BOOKING_MIN).map((s) =>
        Date.parse(moscowIso(date, s)),
      ),
    [venue.working_hours, date],
  );
  const dayClosed = startMsList.length === 0;
  const freeCount = useMemo(() => {
    if (!tables) return 0;
    return tables.filter((t) => {
      if (!t.is_active) return false;
      const starts = availableStartsForTable(
        venue.working_hours,
        t.schedule,
        date,
        MIN_BOOKING_MIN,
      ).map((s) => Date.parse(moscowIso(date, s)));
      return hasFreeSlot(t.bookings, starts);
    }).length;
  }, [tables, venue.working_hours, date]);

  if (!canEdit && tables && tables.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-fg">Схема зала</h2>
        {canEdit && mode === "view" && hasMap && (
          <Button size="sm" variant="secondary" onClick={() => setMode("edit")}>
            <IconPencil size={15} />
            Редактировать
          </Button>
        )}
      </div>

      {layoutQuery.isPending ? (
        <Skeleton className="h-64 w-full sm:h-80" />
      ) : layoutQuery.isError ? (
        <ErrorState onRetry={() => layoutQuery.refetch()} />
      ) : !hasMap && mode === "view" ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface-2 px-4 py-10 text-center">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-surface text-muted shadow-card">
            <IconPaddle size={22} />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-bold text-fg">Интерактивной схемы пока нет</p>
            <p className="max-w-sm text-[13px] text-muted">
              Расставьте столы, чтобы гости бронировали места прямо на карте зала.
            </p>
          </div>
          <Button size="sm" onClick={() => setMode("edit")}>
            <IconPlus size={15} />
            Добавить схему
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {mode === "view" && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                {dayPills.map((value, i) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={date === value}
                    onClick={() => setDate(value)}
                    className={cn(
                      "flex-none rounded-pill px-3 py-1.5 text-[13px] font-semibold transition-colors",
                      date === value
                        ? "bg-fg text-white"
                        : "bg-surface-2 text-fg-2 hover:bg-surface-3",
                    )}
                  >
                    {dayPillLabel(value, i)}
                  </button>
                ))}
                <Input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => {
                    if (e.target.value && e.target.value >= today) setDate(e.target.value);
                  }}
                  className="w-auto flex-none"
                />
              </div>

              {dayClosed ? (
                <span className="text-[13px] font-semibold text-muted">
                  Зал в этот день не работает
                </span>
              ) : (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-pill bg-status-open/10 px-2.5 py-1 text-[13px] font-bold text-status-open transition-opacity duration-200",
                    switchingDay && "opacity-40",
                  )}
                >
                  <span className="size-2 rounded-full bg-status-open" />
                  Свободно {freeCount} из {tables?.length ?? 0}
                </span>
              )}
            </div>
          )}

          {mode === "edit" && (
            <p className="text-[13px] font-semibold text-muted">
              Перетаскивайте столы (сетка 10 см), вращайте за маркер или кнопкой 90°. Delete
              удаляет выбранный стол.
            </p>
          )}

          <div className="relative">
            <div
              className={cn(
                "transition-opacity duration-200",
                // Блокируем клики по столам прошлого дня, пока грузится выбранный — иначе бронь уйдёт не в ту дату.
                switchingDay && mode === "view" && "pointer-events-none opacity-40",
              )}
            >
              <HallMap
                venueId={venue.id}
                venueSlug={venue.slug}
                workingHours={venue.working_hours}
                mode={mode}
                date={date}
                onExitEdit={() => setMode("view")}
              />
            </div>
            {switchingDay && mode === "view" && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <BallSpinner size={26} />
              </div>
            )}
          </div>

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
