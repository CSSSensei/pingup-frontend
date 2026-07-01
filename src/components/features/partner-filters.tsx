"use client";

import { ChipSelect, FilterBar, FilterRow, type FilterOption } from "@/components/features/filters/filter-bar";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { EVENT_TYPES, EVENT_TYPE_LABELS, GENDERS, GENDER_LABELS } from "@/lib/enums";
import type { PartnerRequestFilterParams } from "@/types/api";

const TYPE_OPTIONS: FilterOption[] = [
  { value: "", label: "Любой" },
  ...EVENT_TYPES.map((t) => ({ value: t, label: EVENT_TYPE_LABELS[t] })),
];

const GENDER_OPTIONS: FilterOption[] = [
  { value: "", label: "Любой" },
  ...GENDERS.map((g) => ({ value: g, label: GENDER_LABELS[g] })),
];

// Читаем рейтинг как неотрицательное целое — так же, как парсит его back-параметр из URL.
function toNum(v: string): number | undefined {
  const n = Number(v);
  if (v.trim() === "" || !Number.isFinite(n)) return undefined;
  const i = Math.trunc(n);
  return i >= 0 ? i : undefined;
}

export function PartnerFilters({
  value,
  onChange,
  showSuitable = false,
}: {
  value: PartnerRequestFilterParams;
  onChange: (patch: Partial<PartnerRequestFilterParams>) => void;
  showSuitable?: boolean;
}) {
  return (
    <FilterBar>
      <FilterRow label="Тип">
        <ChipSelect
          ariaLabel="Тип объявления"
          options={TYPE_OPTIONS}
          value={value.event_type ?? ""}
          onChange={(v) => onChange({ event_type: (v || undefined) as never })}
        />
      </FilterRow>

      <FilterRow label="Кого ищут">
        <ChipSelect
          ariaLabel="Кого ищут"
          options={GENDER_OPTIONS}
          value={value.desired_gender ?? ""}
          onChange={(v) => onChange({ desired_gender: (v || undefined) as never })}
        />
      </FilterRow>

      <FilterRow label="Рейтинг">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="от"
            aria-label="Рейтинг от"
            className="h-10 w-24"
            value={value.rating_min ?? ""}
            onChange={(e) => onChange({ rating_min: toNum(e.target.value) })}
          />
          <span className="text-muted">—</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="до"
            aria-label="Рейтинг до"
            className="h-10 w-24"
            value={value.rating_max ?? ""}
            onChange={(e) => onChange({ rating_max: toNum(e.target.value) })}
          />
        </div>
      </FilterRow>

      {showSuitable && (
        <FilterRow label="Показ">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-fg-2">
            <Switch
              checked={value.suitable ?? false}
              onCheckedChange={(v) => onChange({ suitable: v || undefined })}
            />
            Подходящие мне
          </label>
        </FilterRow>
      )}
    </FilterBar>
  );
}
