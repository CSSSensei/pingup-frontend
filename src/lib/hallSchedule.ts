import { isoToMoscowDate, isoToMoscowTime } from "@/lib/schemas/event";
import type { TableBooking } from "@/types/api";

export interface DayInterval {
  open: string;
  close: string;
}

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const WEEKDAY_BY_JS_DAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const DEFAULT_DAY: DayInterval[] = [{ open: "08:00", close: "22:00" }];

const SLOT_STEP_MIN = 30;
export const MIN_BOOKING_MIN = 30;

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function fromMin(min: number): string {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function parseDay(value: unknown): DayInterval[] | null {
  if (!Array.isArray(value)) return null;
  const out: DayInterval[] = [];
  for (const iv of value) {
    if (typeof iv !== "object" || iv === null) return null;
    const { open, close } = iv as Record<string, unknown>;
    if (typeof open !== "string" || typeof close !== "string") return null;
    if (!TIME_RE.test(open) || !TIME_RE.test(close) || toMin(close) <= toMin(open)) return null;
    out.push({ open, close });
  }
  return out.sort((a, b) => toMin(a.open) - toMin(b.open));
}

function parseSchedule(workingHours: Record<string, unknown> | null): Record<string, DayInterval[]> | null {
  const schedule = workingHours?.schedule;
  if (typeof schedule !== "object" || schedule === null || Array.isArray(schedule)) return null;
  const out: Record<string, DayInterval[]> = {};
  for (const [day, raw] of Object.entries(schedule as Record<string, unknown>)) {
    if (!WEEKDAY_KEYS.includes(day)) return null;
    if (raw == null) continue;
    const parsed = parseDay(raw);
    if (parsed === null) return null;
    out[day] = parsed;
  }
  return out;
}

export function dayIntervals(
  workingHours: Record<string, unknown> | null,
  date: string,
): DayInterval[] {
  const schedule = parseSchedule(workingHours);
  if (!schedule) return DEFAULT_DAY;
  const dow = new Date(`${date}T12:00:00Z`).getUTCDay();
  if (Number.isNaN(dow)) return [];
  return schedule[WEEKDAY_BY_JS_DAY[dow]] ?? [];
}

export function slotStarts(intervals: DayInterval[], durationMin: number): string[] {
  const out: string[] = [];
  for (const { open, close } of intervals) {
    const end = toMin(close);
    for (let t = toMin(open); t + durationMin <= end; t += SLOT_STEP_MIN) {
      out.push(fromMin(t));
    }
  }
  return out;
}

export function availableStarts(
  workingHours: Record<string, unknown> | null,
  date: string,
  durationMin: number,
): string[] {
  if (!date) return [];
  const nowIso = new Date().toISOString();
  const today = isoToMoscowDate(nowIso);
  const nowTime = isoToMoscowTime(nowIso);
  return slotStarts(dayIntervals(workingHours, date), durationMin).filter(
    (s) => date !== today || s > nowTime,
  );
}

export function slotEnd(start: string, durationMin: number): string {
  return fromMin(toMin(start) + durationMin);
}

export function overlaps(bookings: TableBooking[], startMs: number, endMs: number): boolean {
  return bookings.some((b) => Date.parse(b.starts_at) < endMs && Date.parse(b.ends_at) > startMs);
}
