"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { PartnerFilters } from "@/components/features/partner-filters";
import { PartnerRequestCard } from "@/components/features/partner-request-card";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { IconUsers } from "@/components/ui/icons";
import { usePartnerRequests } from "@/hooks/usePartners";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import { EVENT_TYPES, GENDERS, type EventType, type Gender } from "@/lib/enums";
import type { PartnerRequestFilterParams } from "@/types/api";

const asType = (v: string | null): EventType | undefined =>
  v && (EVENT_TYPES as readonly string[]).includes(v) ? (v as EventType) : undefined;
const asGender = (v: string | null): Gender | undefined =>
  v && (GENDERS as readonly string[]).includes(v) ? (v as Gender) : undefined;

function PartnersListInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const eventType = asType(params.get("type"));
  const gender = asGender(params.get("gender"));

  const filter: PartnerRequestFilterParams = {
    city_id: SMOLENSK_CITY_ID,
    ...(eventType ? { event_type: eventType } : {}),
    ...(gender ? { desired_gender: gender } : {}),
  };

  const query = usePartnerRequests(filter);

  const patch = (p: Partial<PartnerRequestFilterParams>) => {
    const next = new URLSearchParams(params.toString());
    if ("event_type" in p) setOrDelete(next, "type", p.event_type);
    if ("desired_gender" in p) setOrDelete(next, "gender", p.desired_gender);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-5">
      <PartnerFilters value={filter} onChange={patch} />

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={34} />}
          title="Пока нет объявлений"
          description="Здесь появятся объявления о поиске напарника в Смоленске. Создайте своё — его увидят другие игроки."
        />
      ) : (
        <div className="space-y-3">
          {query.data.items.map((request) => (
            <PartnerRequestCard key={request.id} request={request} />
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

export function PartnersListView() {
  return (
    <Suspense fallback={<CardListSkeleton />}>
      <PartnersListInner />
    </Suspense>
  );
}
