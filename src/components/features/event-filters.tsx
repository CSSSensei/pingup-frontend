"use client";

import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { GENDERS, GENDER_LABELS, SKILL_LABELS, SKILL_LEVELS } from "@/lib/enums";
import type { EventFilterParams } from "@/types/api";

export function EventFilters({
  value,
  onChange,
}: {
  value: EventFilterParams;
  onChange: (patch: Partial<EventFilterParams>) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Select
        aria-label="Уровень"
        className="h-10 w-auto min-w-[140px]"
        value={value.skill_level ?? ""}
        onChange={(e) => onChange({ skill_level: (e.target.value || undefined) as never })}
      >
        <option value="">Любой уровень</option>
        {SKILL_LEVELS.map((lvl) => (
          <option key={lvl} value={lvl}>
            {SKILL_LABELS[lvl]}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Пол"
        className="h-10 w-auto min-w-[120px]"
        value={value.gender ?? ""}
        onChange={(e) => onChange({ gender: (e.target.value || undefined) as never })}
      >
        <option value="">Любой пол</option>
        {GENDERS.map((g) => (
          <option key={g} value={g}>
            {GENDER_LABELS[g]}
          </option>
        ))}
      </Select>

      <label className="flex h-10 cursor-pointer items-center gap-2 rounded border border-border bg-surface px-3 text-sm font-semibold text-fg-2">
        <Switch
          checked={value.has_slots ?? false}
          onCheckedChange={(v) => onChange({ has_slots: v || undefined })}
        />
        Есть места
      </label>
    </div>
  );
}
