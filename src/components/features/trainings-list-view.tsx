"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { EventCard } from "@/components/features/event-card";
import { EventFilters } from "@/components/features/event-filters";
import { ChipSelect, FilterRow } from "@/components/features/filters/filter-bar";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { IconCalendar } from "@/components/ui/icons";
import { useEvents } from "@/hooks/useEvents";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import { GENDERS, SKILL_LEVELS, type Gender, type SkillLevel } from "@/lib/enums";
import { TRAINING_TYPES } from "@/lib/schemas/event";
import type { EventFilterParams } from "@/types/api";

type TrainingType = (typeof TRAINING_TYPES)[number];

const TYPE_OPTIONS = [
  { value: "", label: "Все" },
  { value: "group_training", label: "Групповые" },
  { value: "personal_sparring", label: "Спарринги" },
];

const asSkill = (v: string | null): SkillLevel | undefined =>
  v && (SKILL_LEVELS as readonly string[]).includes(v) ? (v as SkillLevel) : undefined;
const asGender = (v: string | null): Gender | undefined =>
  v && (GENDERS as readonly string[]).includes(v) ? (v as Gender) : undefined;
const asTrainingType = (v: string | null): TrainingType | undefined =>
  v && (TRAINING_TYPES as readonly string[]).includes(v) ? (v as TrainingType) : undefined;

function TrainingsListInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const type = asTrainingType(params.get("type"));
  const skill = asSkill(params.get("level"));
  const gender = asGender(params.get("gender"));
  const hasSlots = params.get("slots") === "1";

  const common: EventFilterParams = {
    city_id: SMOLENSK_CITY_ID,
    ...(skill ? { skill_level: skill } : {}),
    ...(gender ? { gender } : {}),
    ...(hasSlots ? { has_slots: true } : {}),
  };

  // Бэк фильтрует по одному event_type за запрос — «Все» собираем из двух
  // запросов на клиенте (объёмы городского каталога это позволяют).
  const groupQuery = useEvents({ ...common, event_type: "group_training" });
  const sparringQuery = useEvents({ ...common, event_type: "personal_sparring" });
  const active =
    type === "group_training"
      ? [groupQuery]
      : type === "personal_sparring"
        ? [sparringQuery]
        : [groupQuery, sparringQuery];

  const isPending = active.some((q) => q.isPending);
  const isError = active.some((q) => q.isError);
  const items = active
    .flatMap((q) => q.data?.items ?? [])
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  const patch = (p: Partial<EventFilterParams>) => {
    const next = new URLSearchParams(params.toString());
    if ("skill_level" in p) setOrDelete(next, "level", p.skill_level);
    if ("gender" in p) setOrDelete(next, "gender", p.gender);
    if ("has_slots" in p) setOrDelete(next, "slots", p.has_slots ? "1" : undefined);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const setType = (v: string) => {
    const next = new URLSearchParams(params.toString());
    setOrDelete(next, "type", v || undefined);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-5">
      <EventFilters value={common} onChange={patch}>
        <FilterRow label="Тип">
          <ChipSelect
            ariaLabel="Тип тренировки"
            options={TYPE_OPTIONS}
            value={type ?? ""}
            onChange={setType}
          />
        </FilterRow>
      </EventFilters>

      {isPending ? (
        <CardListSkeleton />
      ) : isError ? (
        <ErrorState onRetry={() => active.forEach((q) => q.refetch())} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<IconCalendar size={34} />}
          title="Пока нет тренировок"
          description="Здесь появятся групповые тренировки и спарринги в Смоленске. Создайте свою."
        />
      ) : (
        <div className="pu-reveal space-y-3">
          {items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function setOrDelete(params: URLSearchParams, key: string, value: string | undefined) {
  if (value) params.set(key, value);
  else params.delete(key);
}

export function TrainingsListView() {
  return (
    <Suspense fallback={<CardListSkeleton />}>
      <TrainingsListInner />
    </Suspense>
  );
}
