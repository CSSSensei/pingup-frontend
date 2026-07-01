"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { PlayerCard } from "@/components/features/player-card";
import { PlayerFilters } from "@/components/features/player-filters";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { IconUser } from "@/components/ui/icons";
import { useProfiles } from "@/hooks/useProfiles";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import { GENDERS, SKILL_LEVELS, type Gender, type SkillLevel } from "@/lib/enums";
import type { ProfileFilterParams } from "@/types/api";

const SORT_VALUES = ["-current_rating", "display_name"] as const;

const asSkill = (v: string | null): SkillLevel | undefined =>
  v && (SKILL_LEVELS as readonly string[]).includes(v) ? (v as SkillLevel) : undefined;
const asGender = (v: string | null): Gender | undefined =>
  v && (GENDERS as readonly string[]).includes(v) ? (v as Gender) : undefined;
const asSort = (v: string | null): string | undefined =>
  v && (SORT_VALUES as readonly string[]).includes(v) ? v : undefined;
const asPositiveInt = (v: string | null): number | undefined => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
};

function PlayersListInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const skill = asSkill(params.get("skill"));
  const gender = asGender(params.get("gender"));
  const ratingMin = asPositiveInt(params.get("rmin"));
  const ratingMax = asPositiveInt(params.get("rmax"));
  const sort = asSort(params.get("sort"));
  const isCoach = params.get("coach") === "1";
  const qParam = params.get("q") ?? "";

  // Поиск набирается локально и попадает в URL/запрос с задержкой — без спама на каждый символ.
  const [search, setSearch] = useState(qParam);
  useEffect(() => setSearch(qParam), [qParam]);
  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === qParam) return;
    const t = setTimeout(() => patch({ q: trimmed || undefined }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filter: ProfileFilterParams = {
    city_id: SMOLENSK_CITY_ID,
    ...(qParam ? { q: qParam } : {}),
    ...(skill ? { skill_level: skill } : {}),
    ...(gender ? { gender } : {}),
    ...(ratingMin != null ? { rating_min: ratingMin } : {}),
    ...(ratingMax != null ? { rating_max: ratingMax } : {}),
    ...(sort ? { sort } : {}),
    ...(isCoach ? { is_coach: true } : {}),
  };

  const query = useProfiles(filter);

  function patch(p: Partial<ProfileFilterParams>) {
    const next = new URLSearchParams(params.toString());
    if ("q" in p) setOrDelete(next, "q", p.q);
    if ("skill_level" in p) setOrDelete(next, "skill", p.skill_level);
    if ("gender" in p) setOrDelete(next, "gender", p.gender);
    if ("rating_min" in p) setOrDelete(next, "rmin", numToParam(p.rating_min));
    if ("rating_max" in p) setOrDelete(next, "rmax", numToParam(p.rating_max));
    if ("sort" in p) setOrDelete(next, "sort", p.sort);
    if ("is_coach" in p) setOrDelete(next, "coach", p.is_coach ? "1" : undefined);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="space-y-5">
      <PlayerFilters value={filter} search={search} onSearch={setSearch} onChange={patch} />

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EmptyState
          icon={<IconUser size={34} />}
          title="Игроков не нашлось"
          description="Под выбранные фильтры никого нет. Попробуйте сбросить фильтры."
        />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {query.data.items.map((player) => (
              <PlayerCard key={player.slug ?? player.display_name} player={player} />
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

function numToParam(v: number | undefined): string | undefined {
  return v == null ? undefined : String(v);
}

function setOrDelete(params: URLSearchParams, key: string, value: string | undefined) {
  if (value) params.set(key, value);
  else params.delete(key);
}

export function PlayersListView() {
  return (
    <Suspense fallback={<CardListSkeleton />}>
      <PlayersListInner />
    </Suspense>
  );
}
