"use client";

import { Select } from "@/components/ui/select";
import { EVENT_TYPES, EVENT_TYPE_LABELS, GENDERS, GENDER_LABELS } from "@/lib/enums";
import type { PartnerRequestFilterParams } from "@/types/api";

export function PartnerFilters({
  value,
  onChange,
}: {
  value: PartnerRequestFilterParams;
  onChange: (patch: Partial<PartnerRequestFilterParams>) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Select
        aria-label="Формат"
        className="h-10 w-auto min-w-[150px]"
        value={value.event_type ?? ""}
        onChange={(e) => onChange({ event_type: (e.target.value || undefined) as never })}
      >
        <option value="">Любой формат</option>
        {EVENT_TYPES.map((t) => (
          <option key={t} value={t}>
            {EVENT_TYPE_LABELS[t]}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Кого ищут"
        className="h-10 w-auto min-w-[140px]"
        value={value.desired_gender ?? ""}
        onChange={(e) => onChange({ desired_gender: (e.target.value || undefined) as never })}
      >
        <option value="">Любой пол</option>
        {GENDERS.map((g) => (
          <option key={g} value={g}>
            {GENDER_LABELS[g]}
          </option>
        ))}
      </Select>
    </div>
  );
}
