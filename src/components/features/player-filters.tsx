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
import { GENDERS, GENDER_LABELS, SKILL_LABELS, SKILL_LEVELS } from "@/lib/enums";
import type { ProfileFilterParams } from "@/types/api";

const SKILL_OPTIONS: FilterOption[] = [
  { value: "", label: "Любой" },
  ...SKILL_LEVELS.map((s) => ({ value: s, label: SKILL_LABELS[s] })),
];

const GENDER_OPTIONS: FilterOption[] = [
  { value: "", label: "Любой" },
  ...GENDERS.map((g) => ({ value: g, label: GENDER_LABELS[g] })),
];

// Значения sort → wire-параметр back-сортировки (whitelist на бэке: display_name/current_rating/created_at).
export const SORT_OPTIONS: FilterOption[] = [
  { value: "", label: "Новые" },
  { value: "-current_rating", label: "По рейтингу" },
  { value: "display_name", label: "По имени" },
];

function toNum(v: string): number | undefined {
  const n = Number(v);
  if (v.trim() === "" || !Number.isFinite(n)) return undefined;
  const i = Math.trunc(n);
  return i >= 0 ? i : undefined;
}

export function PlayerFilters({
  value,
  search,
  onSearch,
  onChange,
}: {
  value: ProfileFilterParams;
  search: string;
  onSearch: (q: string) => void;
  onChange: (patch: Partial<ProfileFilterParams>) => void;
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
          placeholder="Поиск по имени"
          aria-label="Поиск игрока по имени"
          className="h-11 pl-10"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <FilterBar>
        <FilterRow label="Уровень">
          <ChipSelect
            ariaLabel="Уровень игры"
            options={SKILL_OPTIONS}
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

        <FilterRow label="Сортировка">
          <ChipSelect
            ariaLabel="Сортировка"
            options={SORT_OPTIONS}
            value={value.sort ?? ""}
            onChange={(v) => onChange({ sort: v || undefined })}
          />
        </FilterRow>

        <FilterRow label="Тренеры">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-fg-2">
            <Switch
              checked={value.is_coach ?? false}
              onCheckedChange={(v) => onChange({ is_coach: v || undefined })}
            />
            Только тренеры
          </label>
        </FilterRow>
      </FilterBar>
    </div>
  );
}
