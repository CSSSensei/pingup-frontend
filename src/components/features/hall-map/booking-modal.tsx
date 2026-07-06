"use client";

import { useMemo, useState } from "react";

import { ContactGateNotice } from "@/components/features/contact-gate";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useCancelBooking, useCreateBooking, useVenueLayout } from "@/hooks/useHallMap";
import { useHasContact } from "@/hooks/useHasContact";
import { availableStartsForTable, dayIntervals, overlaps, slotEnd } from "@/lib/hallSchedule";
import { formatTimeRange } from "@/lib/format";
import { isoToMoscowDate, moscowIso } from "@/lib/schemas/event";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";
import type { HallTable } from "@/types/api";

const DURATIONS = [
  { min: 30, label: "30 минут" },
  { min: 60, label: "1 час" },
  { min: 90, label: "1,5 часа" },
  { min: 120, label: "2 часа" },
  { min: 180, label: "3 часа" },
  { min: 240, label: "4 часа" },
];

export function BookingModal({
  venueId,
  venueSlug,
  workingHours,
  table,
  initialDate,
  onClose,
}: {
  venueId: number;
  venueSlug: string;
  workingHours: Record<string, unknown> | null;
  table: HallTable;
  initialDate: string;
  onClose: () => void;
}) {
  const authed = useAuthStore((s) => s.status) === "authed";
  const hasContact = useHasContact();
  const today = isoToMoscowDate(new Date().toISOString());
  const [date, setDate] = useState(initialDate);
  const [duration, setDuration] = useState(60);
  const [start, setStart] = useState("");

  const layoutQuery = useVenueLayout(venueId, date);
  const createBooking = useCreateBooking(venueId, date);
  const cancelBooking = useCancelBooking(venueId);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const slotsLoading = layoutQuery.isPending || layoutQuery.isFetching;
  const bookings = useMemo(
    () => layoutQuery.data?.tables.find((t) => t.id === table.id)?.bookings ?? [],
    [layoutQuery.data, table.id],
  );

  const dayClosed = useMemo(
    () => dayIntervals(workingHours, date).length === 0,
    [workingHours, date],
  );

  const chips = useMemo(() => {
    return availableStartsForTable(workingHours, table.schedule, date, duration).filter((s) => {
      const startMs = Date.parse(moscowIso(date, s));
      return !overlaps(bookings, startMs, startMs + duration * 60_000);
    });
  }, [workingHours, table.schedule, date, duration, bookings]);

  const selectedStart = chips.includes(start) ? start : "";

  const chipsByHour = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const s of chips) {
      const hour = `${s.slice(0, 2)}:00`;
      groups.set(hour, [...(groups.get(hour) ?? []), s]);
    }
    return [...groups.entries()];
  }, [chips]);

  const myBookings = bookings.filter(
    (b) => b.is_mine && b.id > 0 && Date.parse(b.ends_at) > Date.now(),
  );

  async function submit() {
    if (!selectedStart) return;
    const range = `${selectedStart}–${slotEnd(selectedStart, duration)}`;
    try {
      await createBooking.mutateAsync({
        table_id: table.id,
        starts_at: moscowIso(date, selectedStart),
        ends_at: moscowIso(date, slotEnd(selectedStart, duration)),
      });
      toast.success(`Стол ${table.label} забронирован: ${range}`);
      onClose();
    } catch {
      // ошибка уже показана в onError мутации
    }
  }

  function cancel(bookingId: number) {
    setCancellingId(bookingId);
    cancelBooking.mutate(bookingId, {
      onSuccess: () => toast.success("Бронь отменена"),
      onSettled: () => setCancellingId(null),
    });
  }

  if (!authed) {
    return (
      <Modal open onClose={onClose} title={`Бронирование стола ${table.label}`}>
        <p className="text-sm font-medium text-fg-2">
          Войдите, чтобы забронировать стол — бронь привязывается к вашему аккаунту.
        </p>
        <div className="mt-5">
          <LinkButton href={`/login?next=${encodeURIComponent(`/venues/${venueSlug}`)}`} fullWidth>
            Войти
          </LinkButton>
        </div>
      </Modal>
    );
  }

  if (hasContact === false) {
    return (
      <Modal open onClose={onClose} title={`Бронирование стола ${table.label}`}>
        <ContactGateNotice text="Бронь привязывается к вам — добавьте контакт (Telegram или телефон), чтобы с вами могли связаться." />
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} title={`Бронирование стола ${table.label}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Дата">
            <Input
              type="date"
              value={date}
              min={today}
              onChange={(e) => {
                if (!e.target.value || e.target.value < today) return;
                setDate(e.target.value);
                setStart("");
              }}
            />
          </Field>
          <Field label="Длительность">
            <Select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              {DURATIONS.map((d) => (
                <option key={d.min} value={d.min}>
                  {d.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {slotsLoading ? (
          <p className="text-sm font-semibold text-muted">Загрузка расписания…</p>
        ) : dayClosed ? (
          <p className="text-sm font-semibold text-muted">Зал в этот день не работает.</p>
        ) : chips.length === 0 ? (
          <p className="text-sm font-semibold text-muted">
            Нет свободного времени на выбранную длительность.
          </p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto pe-1">
            {chipsByHour.map(([hour, starts]) => (
              <div key={hour} className="flex items-center gap-3">
                <span className="w-12 flex-none text-sm font-semibold text-muted">{hour}</span>
                <div className="flex flex-1 flex-wrap gap-2">
                  {starts.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={s === selectedStart}
                      onClick={() => setStart(s)}
                      className={cn(
                        "h-10 w-[76px] rounded border text-sm font-bold transition-colors",
                        s === selectedStart
                          ? "border-primary bg-primary-tint text-primary"
                          : "border-border bg-surface text-fg hover:border-border-strong",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {myBookings.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[13px] font-bold text-fg-2">Ваши брони этого стола</p>
            {myBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded border border-border bg-surface-2 py-1 ps-3 pe-1 text-sm font-semibold text-fg"
              >
                <span>{formatTimeRange(b.starts_at, b.ends_at)}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger"
                  loading={cancellingId === b.id}
                  onClick={() => cancel(b.id)}
                >
                  Отменить
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Отмена
          </Button>
          <Button
            fullWidth
            disabled={!selectedStart || slotsLoading}
            loading={createBooking.isPending}
            onClick={submit}
          >
            {selectedStart
              ? `Забронировать ${selectedStart}–${slotEnd(selectedStart, duration)}`
              : "Выберите время"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
