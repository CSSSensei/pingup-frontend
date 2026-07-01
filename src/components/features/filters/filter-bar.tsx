"use client";

import type { ReactNode } from "react";

import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string; // "" = «любой»
  label: string;
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-3.5">
      {children}
    </div>
  );
}

export function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="min-w-[64px] flex-none text-xs font-bold text-muted">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

// Демо-канон: на широких экранах — чипы (явный выбор), на мобиле — выпадающий список.
export function ChipSelect({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <>
      <div role="group" aria-label={ariaLabel} className="hidden flex-wrap gap-1.5 lg:flex">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value || "__any"}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "rounded-pill border px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors",
                active
                  ? "border-transparent bg-fg text-white"
                  : "border-border bg-surface text-fg-2 hover:bg-surface-2",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <Select
        aria-label={ariaLabel}
        className="h-10 lg:hidden"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value || "__any"} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </>
  );
}
