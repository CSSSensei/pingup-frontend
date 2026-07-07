"use client";

import { IconPlus, IconX } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { WEEKDAYS, type Interval, type Weekday, type WeekSchedule } from "@/lib/schedule";

function addHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const total = Math.min(h * 60 + m + 60, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function WeekScheduleEditor({
  value,
  onChange,
  errors,
}: {
  value: WeekSchedule;
  onChange: (next: WeekSchedule) => void;
  errors?: string[];
}) {
  function setDay(day: Weekday, intervals: Interval[]) {
    onChange({ ...value, [day]: intervals });
  }

  function patchInterval(day: Weekday, i: number, patch: Partial<Interval>) {
    setDay(
      day,
      value[day].map((iv, j) => (j === i ? { ...iv, ...patch } : iv)),
    );
  }

  function addInterval(day: Weekday) {
    const last = value[day][value[day].length - 1];
    if (!last) {
      setDay(day, [{ open: "09:00", close: "22:00" }]);
      return;
    }
    // Новый слот начинается после предыдущего; закрытие = открытие + 1ч (не даём open == close).
    const open = last.close;
    setDay(day, [...value[day], { open, close: addHour(open) }]);
  }

  function copyMondayToAll() {
    const next = { ...value };
    for (const { key } of WEEKDAYS) next[key] = value.mon.map((iv) => ({ ...iv }));
    onChange(next);
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-col divide-y divide-border rounded border border-border">
        {WEEKDAYS.map(({ key, short, full }) => {
          const intervals = value[key];
          const isOpen = intervals.length > 0;
          return (
            <div key={key} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-2.5">
              <div className="flex w-[104px] flex-none items-center gap-2.5">
                <span className="w-6 text-[13px] font-bold text-fg" title={full}>
                  {short}
                </span>
                <Switch
                  checked={isOpen}
                  onCheckedChange={(v) => setDay(key, v ? [{ open: "09:00", close: "22:00" }] : [])}
                  label={`${full} — ${isOpen ? "открыт" : "выходной"}`}
                />
              </div>

              {isOpen ? (
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  {intervals.map((iv, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Input
                        type="time"
                        aria-label={`${full}: открытие ${i + 1}`}
                        value={iv.open}
                        onChange={(e) => patchInterval(key, i, { open: e.target.value })}
                        className="w-[108px]"
                      />
                      <span className="text-muted">–</span>
                      <Input
                        type="time"
                        aria-label={`${full}: закрытие ${i + 1}`}
                        value={iv.close}
                        onChange={(e) => patchInterval(key, i, { close: e.target.value })}
                        className="w-[108px]"
                      />
                      <button
                        type="button"
                        aria-label="Удалить интервал"
                        onClick={() => setDay(key, intervals.filter((_, j) => j !== i))}
                        className="inline-flex size-7 items-center justify-center rounded text-muted hover:bg-surface-2 hover:text-danger"
                      >
                        <IconX size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addInterval(key)}
                    className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
                  >
                    <IconPlus size={14} />
                    интервал
                  </button>
                </div>
              ) : (
                <span className="text-[13px] font-semibold text-muted">Выходной</span>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={copyMondayToAll}
        className="text-[13px] font-semibold text-primary hover:underline"
      >
        Скопировать понедельник на все дни
      </button>

      {errors && errors.length > 0 && (
        <ul className="space-y-0.5 text-xs font-semibold text-danger">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
