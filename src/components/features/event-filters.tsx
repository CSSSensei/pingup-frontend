"use client";

import { ChipSelect, FilterBar, FilterRow, type FilterOption } from "@/components/features/filters/filter-bar";
import { Switch } from "@/components/ui/switch";
import { GENDERS, GENDER_LABELS, SKILL_LABELS, SKILL_LEVELS } from "@/lib/enums";
import type { EventFilterParams } from "@/types/api";

const LEVEL_OPTIONS: FilterOption[] = [
  { value: "", label: "Любой" },
  ...SKILL_LEVELS.map((l) => ({ value: l, label: SKILL_LABELS[l] })),
];

const GENDER_OPTIONS: FilterOption[] = [
  { value: "", label: "Любой" },
  ...GENDERS.map((g) => ({ value: g, label: GENDER_LABELS[g] })),
];

export function EventFilters({
  value,
  onChange,
}: {
  value: EventFilterParams;
  onChange: (patch: Partial<EventFilterParams>) => void;
}) {
  return (
    <FilterBar>
      <FilterRow label="Уровень">
        <ChipSelect
          ariaLabel="Уровень"
          options={LEVEL_OPTIONS}
          value={value.skill_level ?? ""}
          onChange={(v) => onChange({ skill_level: (v || undefined) as never })}
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

      <FilterRow label="Места">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-fg-2">
          <Switch
            checked={value.has_slots ?? false}
            onCheckedChange={(v) => onChange({ has_slots: v || undefined })}
          />
          Есть места
        </label>
      </FilterRow>
    </FilterBar>
  );
}
