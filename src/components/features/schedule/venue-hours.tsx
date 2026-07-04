"use client";

import { useState } from "react";

import { IconChevronRight, IconClock } from "@/components/ui/icons";
import { formatWeekScheduleBrief, groupWeek, type WeekSchedule } from "@/lib/schedule";
import { cn } from "@/lib/utils";

export function VenueHours({ schedule }: { schedule: WeekSchedule }) {
  const [open, setOpen] = useState(false);
  const groups = groupWeek(schedule);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left text-[14px] font-medium text-fg-2 hover:text-fg"
      >
        <IconClock size={16} className="flex-none text-muted" />
        <span className="min-w-0 flex-1 truncate">{formatWeekScheduleBrief(schedule)}</span>
        <IconChevronRight
          size={16}
          className={cn("flex-none text-muted transition-transform", open && "rotate-90")}
        />
      </button>

      {open && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 rounded border border-border bg-surface-2 p-3 text-[13px]">
          {groups.map((g) => (
            <div key={g.label} className="contents">
              <dt className="font-bold text-fg-2">{g.label}</dt>
              <dd
                className={cn("font-semibold", g.intervals.length ? "text-fg" : "text-muted")}
              >
                {g.intervals.length
                  ? g.intervals.map((iv) => `${iv.open}–${iv.close}`).join(", ")
                  : "Выходной"}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
