export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Interval {
  open: string;
  close: string;
}

export type WeekSchedule = Record<Weekday, Interval[]>;

// Проводной формат: только непустые дни (столы хранят голую карту без обёртки {schedule}).
export type WeekScheduleMap = Partial<Record<Weekday, Interval[]>>;

export const WEEKDAYS: { key: Weekday; short: string; full: string }[] = [
  { key: "mon", short: "Пн", full: "Понедельник" },
  { key: "tue", short: "Вт", full: "Вторник" },
  { key: "wed", short: "Ср", full: "Среда" },
  { key: "thu", short: "Чт", full: "Четверг" },
  { key: "fri", short: "Пт", full: "Пятница" },
  { key: "sat", short: "Сб", full: "Суббота" },
  { key: "sun", short: "Вс", full: "Воскресенье" },
];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function emptyWeek(): WeekSchedule {
  return { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
}

export function defaultWeek(): WeekSchedule {
  const iv: Interval[] = [{ open: "09:00", close: "22:00" }];
  return { mon: [...iv], tue: [...iv], wed: [...iv], thu: [...iv], fri: [...iv], sat: [...iv], sun: [...iv] };
}

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Голая карта дней {mon:[{open,close}]…} → полная неделя; мусор → null.
export function parseScheduleMap(raw: unknown): WeekSchedule | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const out = emptyWeek();
  for (const { key } of WEEKDAYS) {
    const day = (raw as Record<string, unknown>)[key];
    if (day == null) continue;
    if (!Array.isArray(day)) return null;
    for (const iv of day) {
      if (!iv || typeof iv !== "object") return null;
      const { open, close } = iv as Record<string, unknown>;
      if (typeof open !== "string" || typeof close !== "string") return null;
      if (!TIME_RE.test(open) || !TIME_RE.test(close) || toMin(close) <= toMin(open)) return null;
      out[key].push({ open, close });
    }
    out[key].sort((a, b) => toMin(a.open) - toMin(b.open));
  }
  return out;
}

export function parseWeekSchedule(raw: unknown): WeekSchedule | null {
  const schedule =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>).schedule : null;
  return parseScheduleMap(schedule);
}

export function toScheduleMap(ws: WeekSchedule): WeekScheduleMap {
  const map: WeekScheduleMap = {};
  for (const { key } of WEEKDAYS) {
    if (ws[key].length > 0) map[key] = ws[key];
  }
  return map;
}

export function fillWeek(map: WeekScheduleMap | null): WeekSchedule {
  const out = emptyWeek();
  if (!map) return out;
  for (const { key } of WEEKDAYS) if (map[key]) out[key] = map[key]!.map((iv) => ({ ...iv }));
  return out;
}

export function serializeWeekSchedule(ws: WeekSchedule): { schedule: WeekScheduleMap } {
  return { schedule: toScheduleMap(ws) };
}

export function validateWeekSchedule(ws: WeekSchedule): string[] {
  const errors: string[] = [];
  for (const { key, short } of WEEKDAYS) {
    if (ws[key].some((iv) => toMin(iv.close) <= toMin(iv.open))) {
      errors.push(`${short}: закрытие должно быть позже открытия`);
    }
    const sorted = [...ws[key]].sort((a, b) => toMin(a.open) - toMin(b.open));
    for (let i = 1; i < sorted.length; i++) {
      if (toMin(sorted[i].open) < toMin(sorted[i - 1].close)) {
        errors.push(`${short}: интервалы пересекаются`);
        break;
      }
    }
  }
  return errors;
}

function sameIntervals(a: Interval[], b: Interval[]): boolean {
  return a.length === b.length && a.every((iv, i) => iv.open === b[i].open && iv.close === b[i].close);
}

function dayText(intervals: Interval[]): string {
  if (intervals.length === 0) return "выходной";
  return intervals.map((iv) => `${iv.open}–${iv.close}`).join(", ");
}

// Только крайние точки дня, без перерывов: «08:00–22:00».
function daySpan(intervals: Interval[]): string {
  if (intervals.length === 0) return "выходной";
  return `${intervals[0].open}–${intervals[intervals.length - 1].close}`;
}

export interface ScheduleGroup {
  label: string;
  intervals: Interval[];
}

// Схлопывает подряд идущие одинаковые дни в диапазоны (Пн–Пт …).
export function groupWeek(ws: WeekSchedule): ScheduleGroup[] {
  const groups: ScheduleGroup[] = [];
  let start = 0;
  for (let i = 1; i <= WEEKDAYS.length; i++) {
    const prev = WEEKDAYS[i - 1].key;
    const curr = i < WEEKDAYS.length ? WEEKDAYS[i].key : null;
    if (curr && sameIntervals(ws[prev], ws[curr])) continue;
    const label =
      start === i - 1
        ? WEEKDAYS[start].short
        : `${WEEKDAYS[start].short}–${WEEKDAYS[i - 1].short}`;
    groups.push({ label, intervals: ws[WEEKDAYS[start].key] });
    start = i;
  }
  return groups;
}

// Полная строка с перерывами: «Пн–Пт 09:00–13:00, 14:00–22:00 · …».
export function formatWeekSchedule(ws: WeekSchedule): string {
  return groupWeek(ws)
    .map((g) => `${g.label} ${dayText(g.intervals)}`)
    .join(" · ");
}

// Краткая строка без перерывов — для карточки и свёрнутого вида.
export function formatWeekScheduleBrief(ws: WeekSchedule): string {
  return groupWeek(ws)
    .map((g) => `${g.label} ${daySpan(g.intervals)}`)
    .join(" · ");
}
