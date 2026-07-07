"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { EventCard } from "@/components/features/event-card";
import { EventFilters } from "@/components/features/event-filters";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { IconPaddle } from "@/components/ui/icons";
import { useEvents } from "@/hooks/useEvents";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import { GENDERS, SKILL_LEVELS, type Gender, type SkillLevel } from "@/lib/enums";
import type { EventFilterParams } from "@/types/api";

// URL-параметры короче ключей API — читаемее в адресной строке и в шаринге.
const asSkill = (v: string | null): SkillLevel | undefined =>
  v && (SKILL_LEVELS as readonly string[]).includes(v) ? (v as SkillLevel) : undefined;
const asGender = (v: string | null): Gender | undefined =>
  v && (GENDERS as readonly string[]).includes(v) ? (v as Gender) : undefined;

function GamesListInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const skill = asSkill(params.get("level"));
  const gender = asGender(params.get("gender"));
  const hasSlots = params.get("slots") === "1";

  const filter: EventFilterParams = {
    event_type: "game",
    city_id: SMOLENSK_CITY_ID,
    limit: 100,
    ...(skill ? { skill_level: skill } : {}),
    ...(gender ? { gender } : {}),
    ...(hasSlots ? { has_slots: true } : {}),
  };

  const query = useEvents(filter);

  const patch = (p: Partial<EventFilterParams>) => {
    const next = new URLSearchParams(params.toString());
    if ("skill_level" in p) setOrDelete(next, "level", p.skill_level);
    if ("gender" in p) setOrDelete(next, "gender", p.gender);
    if ("has_slots" in p) setOrDelete(next, "slots", p.has_slots ? "1" : undefined);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-5">
      <EventFilters value={filter} onChange={patch} />

      {query.isPending ? (
        <CardGridSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EmptyState
          icon={<IconPaddle size={34} />}
          title="Игр не нашлось"
          description="Здесь появятся ближайшие игры в Смоленске. Загляните позже или создайте свою."
        />
      ) : (
        <>
          <div className="pu-reveal grid gap-3 md:grid-cols-2">
            {query.data.items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {query.data.total > query.data.items.length && (
            <p className="text-center text-xs text-muted">
              Показано {query.data.items.length} из {query.data.total}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function setOrDelete(params: URLSearchParams, key: string, value: string | undefined) {
  if (value) params.set(key, value);
  else params.delete(key);
}

export function GamesListView() {
  return (
    <Suspense fallback={<CardGridSkeleton />}>
      <GamesListInner />
    </Suspense>
  );
}
