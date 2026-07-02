"use client";

import {
  ChipSelect,
  FilterBar,
  FilterRow,
  type FilterOption,
} from "@/components/features/filters/filter-bar";
import { IconSearch } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { VenueFilterParams } from "@/types/api";

// Wire-значения сортировки — whitelist бэка: name / rating_avg / created_at.
export const VENUE_SORT_OPTIONS: FilterOption[] = [
  { value: "", label: "Новые" },
  { value: "-rating_avg", label: "По рейтингу" },
  { value: "name", label: "По названию" },
];

function toNum(v: string): number | undefined {
  const n = Number(v);
  if (v.trim() === "" || !Number.isFinite(n)) return undefined;
  const i = Math.trunc(n);
  return i >= 1 ? i : undefined;
}

export function VenueFilters({
  value,
  search,
  onSearch,
  onChange,
}: {
  value: VenueFilterParams;
  search: string;
  onSearch: (q: string) => void;
  onChange: (patch: Partial<VenueFilterParams>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <IconSearch
          size={18}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
        />
        <Input
          type="search"
          placeholder="Поиск по названию зала"
          aria-label="Поиск зала по названию"
          className="h-11 pl-10"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <FilterBar>
        <FilterRow label="Столов">
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="от"
            aria-label="Минимум столов"
            className="h-10 w-24"
            value={value.tables_min ?? ""}
            onChange={(e) => onChange({ tables_min: toNum(e.target.value) })}
          />
        </FilterRow>

        <FilterRow label="Сортировка">
          <ChipSelect
            ariaLabel="Сортировка"
            options={VENUE_SORT_OPTIONS}
            value={value.sort ?? ""}
            onChange={(v) => onChange({ sort: v || undefined })}
          />
        </FilterRow>

        <FilterRow label="Статус">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-fg-2">
            <Switch
              checked={value.is_verified ?? false}
              onCheckedChange={(v) => onChange({ is_verified: v || undefined })}
            />
            Только проверенные
          </label>
        </FilterRow>
      </FilterBar>
    </div>
  );
}
