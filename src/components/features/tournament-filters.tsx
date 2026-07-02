"use client";

import {
  ChipSelect,
  FilterBar,
  FilterRow,
  type FilterOption,
} from "@/components/features/filters/filter-bar";
import {
  GENDERS,
  GENDER_LABELS,
  TOURNAMENT_STATUSES,
  TOURNAMENT_STATUS_LABELS,
} from "@/lib/enums";
import type { TournamentFilterParams } from "@/types/api";

const STATUS_OPTIONS: FilterOption[] = [
  { value: "", label: "Все" },
  ...TOURNAMENT_STATUSES.filter((s) => s !== "cancelled").map((s) => ({
    value: s,
    label: TOURNAMENT_STATUS_LABELS[s],
  })),
];

const OFFICIAL_OPTIONS: FilterOption[] = [
  { value: "", label: "Все" },
  { value: "true", label: "Официальные" },
  { value: "false", label: "Любительские" },
];

const GENDER_OPTIONS: FilterOption[] = [
  { value: "", label: "Любой" },
  ...GENDERS.map((g) => ({ value: g, label: GENDER_LABELS[g] })),
];

export function TournamentFilters({
  value,
  onChange,
}: {
  value: TournamentFilterParams;
  onChange: (patch: Partial<TournamentFilterParams>) => void;
}) {
  const officialValue = value.is_official == null ? "" : String(value.is_official);

  return (
    <FilterBar>
      <FilterRow label="Статус">
        <ChipSelect
          ariaLabel="Статус"
          options={STATUS_OPTIONS}
          value={value.status ?? ""}
          onChange={(v) => onChange({ status: (v || undefined) as never })}
        />
      </FilterRow>

      <FilterRow label="Тип">
        <ChipSelect
          ariaLabel="Тип турнира"
          options={OFFICIAL_OPTIONS}
          value={officialValue}
          onChange={(v) => onChange({ is_official: v === "" ? undefined : v === "true" })}
        />
      </FilterRow>

      <FilterRow label="Пол">
        <ChipSelect
          ariaLabel="Пол"
          options={GENDER_OPTIONS}
          value={value.gender ?? ""}
          onChange={(v) => onChange({ gender: (v || undefined) as never })}
        />
      </FilterRow>
    </FilterBar>
  );
}
