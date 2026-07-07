"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconPlus, IconX } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useCreateScheduleException } from "@/hooks/useMyVenues";
import { ApiError } from "@/lib/api/client";
import { apiErrorMessage } from "@/lib/errors/messages";
import { formatTimeRange } from "@/lib/format";
import { EXC_KIND_LABELS } from "@/lib/scheduleExceptions";
import type { Interval } from "@/lib/schedule";
import type {
  BookingConflict,
  ScheduleExceptionCreatePayload,
  ScheduleExceptionKind,
} from "@/types/api";

const KINDS: ScheduleExceptionKind[] = ["closed", "hours", "block"];

const KIND_HINT: Record<ScheduleExceptionKind, string> = {
  closed: "Ничего нельзя забронировать в выбранные даты.",
  hours: "В эти даты действуют указанные часы вместо обычного расписания.",
  block: "Указанное время исключается из доступного, остальное расписание работает.",
};

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function ScheduleExceptionModal({
  venueId,
  tables,
  today,
  onClose,
}: {
  venueId: number;
  tables: { id: number; label: string }[];
  today: string;
  onClose: () => void;
}) {
  const [scope, setScope] = useState("");
  const [kind, setKind] = useState<ScheduleExceptionKind>("closed");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [intervals, setIntervals] = useState<Interval[]>([{ open: "10:00", close: "16:00" }]);
  const [reason, setReason] = useState("");
  const [conflicts, setConflicts] = useState<BookingConflict[] | null>(null);

  const create = useCreateScheduleException(venueId);
  const needsIntervals = kind !== "closed";

  const intervalsInvalid =
    needsIntervals &&
    (intervals.length === 0 || intervals.some((iv) => toMin(iv.close) <= toMin(iv.open)));
  const invalid = !dateFrom || !dateTo || dateTo < dateFrom || intervalsInvalid;

  function setInterval(i: number, patch: Partial<Interval>) {
    setIntervals((prev) => prev.map((iv, j) => (j === i ? { ...iv, ...patch } : iv)));
  }

  function addInterval() {
    const last = intervals[intervals.length - 1];
    setIntervals((prev) => [...prev, last ? { open: last.close, close: "23:00" } : { open: "10:00", close: "16:00" }]);
  }

  function submit() {
    if (invalid) return;
    setConflicts(null);
    const body: ScheduleExceptionCreatePayload = {
      date_from: dateFrom,
      date_to: dateTo,
      kind,
      ...(scope ? { table_id: Number(scope) } : {}),
      ...(needsIntervals ? { intervals } : {}),
      ...(reason.trim() ? { reason: reason.trim() } : {}),
    };
    create.mutate(body, {
      onSuccess: () => {
        toast.success("Исключение добавлено");
        onClose();
      },
      onError: (err) => {
        if (err instanceof ApiError && err.code === "SCHEDULE_HAS_BOOKINGS") {
          setConflicts(err.details as unknown as BookingConflict[]);
        } else {
          toast.error(apiErrorMessage(err));
        }
      },
    });
  }

  return (
    <Modal open onClose={onClose} title="Исключение в расписании" className="max-w-lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Что закрываем">
            <Select value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="">Весь зал</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  Стол {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Тип">
            <Select
              value={kind}
              onChange={(e) => setKind(e.target.value as ScheduleExceptionKind)}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {EXC_KIND_LABELS[k]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <p className="-mt-1 text-[13px] text-muted">{KIND_HINT[kind]}</p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="С даты">
            <Input
              type="date"
              value={dateFrom}
              min={today}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                setDateFrom(v);
                if (dateTo < v) setDateTo(v);
              }}
            />
          </Field>
          <Field label="По дату">
            <Input
              type="date"
              value={dateTo}
              min={dateFrom || today}
              onChange={(e) => e.target.value && setDateTo(e.target.value)}
            />
          </Field>
        </div>

        {needsIntervals && (
          <div className="space-y-2">
            <span className="text-sm font-bold text-fg-2">
              {kind === "hours" ? "Часы работы в эти даты" : "Заблокированное время"}
            </span>
            <div className="space-y-2">
              {intervals.map((iv, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Input
                    type="time"
                    aria-label={`Начало ${i + 1}`}
                    value={iv.open}
                    onChange={(e) => setInterval(i, { open: e.target.value })}
                    className="w-[120px]"
                  />
                  <span className="text-muted">–</span>
                  <Input
                    type="time"
                    aria-label={`Конец ${i + 1}`}
                    value={iv.close}
                    onChange={(e) => setInterval(i, { close: e.target.value })}
                    className="w-[120px]"
                  />
                  {intervals.length > 1 && (
                    <button
                      type="button"
                      aria-label="Удалить интервал"
                      onClick={() => setIntervals((prev) => prev.filter((_, j) => j !== i))}
                      className="inline-flex size-7 items-center justify-center rounded text-muted hover:bg-surface-2 hover:text-danger"
                    >
                      <IconX size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addInterval}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
              >
                <IconPlus size={14} />
                интервал
              </button>
            </div>
            {intervalsInvalid && (
              <p className="text-xs font-semibold text-danger">
                Конец интервала должен быть позже начала.
              </p>
            )}
          </div>
        )}

        <Field label="Причина (необязательно)">
          <Input
            value={reason}
            maxLength={200}
            placeholder="Ремонт, турнир, санитарный день…"
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>

        {conflicts && conflicts.length > 0 && (
          <div className="space-y-1.5 rounded border border-danger/40 bg-danger/8 p-3">
            <p className="text-[13px] font-bold text-danger">
              В этот период есть брони — сначала отмените их:
            </p>
            <ul className="space-y-0.5 text-[13px] font-medium text-fg-2">
              {conflicts.map((c) => (
                <li key={c.booking_id}>
                  {c.table_label ?? "Стол"} · {formatTimeRange(c.starts_at, c.ends_at)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Отмена
          </Button>
          <Button fullWidth disabled={invalid} loading={create.isPending} onClick={submit}>
            Добавить
          </Button>
        </div>
      </div>
    </Modal>
  );
}
