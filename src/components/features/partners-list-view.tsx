"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { PartnerFilters } from "@/components/features/partner-filters";
import { PartnerRequestCard } from "@/components/features/partner-request-card";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { IconUsers } from "@/components/ui/icons";
import { usePartnerRequests } from "@/hooks/usePartners";
import { useAuthStatus } from "@/hooks/useMe";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import { EVENT_TYPES, GENDERS, type EventType, type Gender } from "@/lib/enums";
import type { PartnerRequestFilterParams } from "@/types/api";

const asType = (v: string | null): EventType | undefined =>
  v && (EVENT_TYPES as readonly string[]).includes(v) ? (v as EventType) : undefined;
const asGender = (v: string | null): Gender | undefined =>
  v && (GENDERS as readonly string[]).includes(v) ? (v as Gender) : undefined;
const asPositiveInt = (v: string | null): number | undefined => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
};

function PartnersListInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const authed = useAuthStatus() === "authed";

  const eventType = asType(params.get("type"));
  const gender = asGender(params.get("gender"));
  const ratingMin = asPositiveInt(params.get("rmin"));
  const ratingMax = asPositiveInt(params.get("rmax"));
  const suitable = authed && params.get("fit") === "1";

  const filter: PartnerRequestFilterParams = {
    city_id: SMOLENSK_CITY_ID,
    ...(eventType ? { event_type: eventType } : {}),
    ...(gender ? { desired_gender: gender } : {}),
    ...(ratingMin != null ? { rating_min: ratingMin } : {}),
    ...(ratingMax != null ? { rating_max: ratingMax } : {}),
    ...(suitable ? { suitable: true } : {}),
  };

  const query = usePartnerRequests(filter);

  const patch = (p: Partial<PartnerRequestFilterParams>) => {
    const next = new URLSearchParams(params.toString());
    if ("event_type" in p) setOrDelete(next, "type", p.event_type);
    if ("desired_gender" in p) setOrDelete(next, "gender", p.desired_gender);
    if ("rating_min" in p) setOrDelete(next, "rmin", numToParam(p.rating_min));
    if ("rating_max" in p) setOrDelete(next, "rmax", numToParam(p.rating_max));
    if ("suitable" in p) setOrDelete(next, "fit", p.suitable ? "1" : undefined);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-5">
      <PartnerFilters value={filter} onChange={patch} showSuitable={authed} />

      {query.isPending ? (
        <CardGridSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={34} />}
          title="Ничего не нашлось"
          description="Под выбранные фильтры объявлений нет. Сбросьте фильтры или создайте своё."
        />
      ) : (
        <div className="pu-reveal grid gap-3 md:grid-cols-2">
          {query.data.items.map((request) => (
            <PartnerRequestCard key={request.id} request={request} />
          ))}
        </div>
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

export function PartnersListView() {
  return (
    <Suspense fallback={<CardGridSkeleton />}>
      <PartnersListInner />
    </Suspense>
  );
}
