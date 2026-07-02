"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { TournamentCard } from "@/components/features/tournament-card";
import { TournamentFilters } from "@/components/features/tournament-filters";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { IconTrophy } from "@/components/ui/icons";
import { useTournaments } from "@/hooks/useTournaments";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import {
  GENDERS,
  TOURNAMENT_STATUSES,
  type Gender,
  type TournamentStatus,
} from "@/lib/enums";
import type { TournamentFilterParams } from "@/types/api";

const asStatus = (v: string | null): TournamentStatus | undefined =>
  v && (TOURNAMENT_STATUSES as readonly string[]).includes(v) ? (v as TournamentStatus) : undefined;
const asGender = (v: string | null): Gender | undefined =>
  v && (GENDERS as readonly string[]).includes(v) ? (v as Gender) : undefined;
const asOfficial = (v: string | null): boolean | undefined =>
  v === "1" ? true : v === "0" ? false : undefined;

function TournamentsListInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const status = asStatus(params.get("status"));
  const gender = asGender(params.get("gender"));
  const official = asOfficial(params.get("official"));

  const filter: TournamentFilterParams = {
    city_id: SMOLENSK_CITY_ID,
    limit: 100,
    ...(status ? { status } : {}),
    ...(gender ? { gender } : {}),
    ...(official != null ? { is_official: official } : {}),
  };

  const query = useTournaments(filter);

  const patch = (p: Partial<TournamentFilterParams>) => {
    const next = new URLSearchParams(params.toString());
    if ("status" in p) setOrDelete(next, "status", p.status);
    if ("gender" in p) setOrDelete(next, "gender", p.gender);
    if ("is_official" in p)
      setOrDelete(next, "official", p.is_official == null ? undefined : p.is_official ? "1" : "0");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-5">
      <TournamentFilters value={filter} onChange={patch} />

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EmptyState
          icon={<IconTrophy size={34} />}
          title="Турниров не нашлось"
          description="Под выбранные фильтры турниров нет. Сбросьте фильтры или создайте свой."
        />
      ) : (
        <div className="space-y-3">
          {query.data.items.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
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

export function TournamentsListView() {
  return (
    <Suspense fallback={<CardListSkeleton />}>
      <TournamentsListInner />
    </Suspense>
  );
}
