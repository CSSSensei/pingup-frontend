"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { VenueCard } from "@/components/features/venue-card";
import { VenueFilters, VENUE_SORT_OPTIONS } from "@/components/features/venue-filters";
import { VenuesMap } from "@/components/maps/venues-map";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { IconPin } from "@/components/ui/icons";
import { useVenues } from "@/hooks/useVenues";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { VenueFilterParams } from "@/types/api";

const asSort = (v: string | null): string | undefined =>
  v && VENUE_SORT_OPTIONS.some((o) => o.value === v) ? v : undefined;
const asPositiveInt = (v: string | null): number | undefined => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 ? n : undefined;
};

function VenuesListInner() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const qParam = params.get("q") ?? "";
  const tablesMin = asPositiveInt(params.get("tables"));
  const verified = params.get("verified") === "1";
  const sort = asSort(params.get("sort"));
  const view = params.get("view") === "map" ? "map" : "list";

  const [search, setSearch] = useState(qParam);
  useEffect(() => setSearch(qParam), [qParam]);
  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === qParam) return;
    const t = setTimeout(() => patch({ q: trimmed || undefined }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Залов в городе немного — берём максимум страницы, карта показывает все разом.
  const filter: VenueFilterParams = {
    city_id: SMOLENSK_CITY_ID,
    limit: 100,
    ...(qParam ? { q: qParam } : {}),
    ...(tablesMin != null ? { tables_min: tablesMin } : {}),
    ...(verified ? { is_verified: true } : {}),
    ...(sort ? { sort } : {}),
  };

  const query = useVenues(filter);

  function patch(p: Partial<VenueFilterParams> & { view?: string }) {
    const next = new URLSearchParams(params.toString());
    if ("q" in p) setOrDelete(next, "q", p.q);
    if ("tables_min" in p) setOrDelete(next, "tables", p.tables_min == null ? undefined : String(p.tables_min));
    if ("is_verified" in p) setOrDelete(next, "verified", p.is_verified ? "1" : undefined);
    if ("sort" in p) setOrDelete(next, "sort", p.sort);
    if ("view" in p) setOrDelete(next, "view", p.view === "map" ? "map" : undefined);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="space-y-5">
      <VenueFilters value={filter} search={search} onSearch={setSearch} onChange={patch} />

      <div className="flex justify-end">
        <div role="group" aria-label="Вид каталога" className="inline-flex rounded-pill border border-border bg-surface p-0.5">
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => patch({ view: v })}
              className={cn(
                "rounded-pill px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                view === v ? "bg-fg text-white" : "text-fg-2 hover:bg-surface-2",
              )}
            >
              {v === "list" ? "Списком" : "На карте"}
            </button>
          ))}
        </div>
      </div>

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EmptyState
          icon={<IconPin size={34} />}
          title="Залов не нашлось"
          description="Под выбранные фильтры залов нет. Сбросьте фильтры или добавьте зал, которого не хватает."
        />
      ) : view === "map" ? (
        <VenuesMap
          points={query.data.items.map((v) => ({
            id: v.id,
            slug: v.slug,
            name: v.name,
            address: v.address,
            lat: v.lat,
            lng: v.lng,
          }))}
          className="h-[420px] sm:h-[500px]"
        />
      ) : (
        <>
          <div className="pu-reveal grid gap-3 md:grid-cols-2">
            {query.data.items.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
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

export function VenuesListView() {
  return (
    <Suspense fallback={<CardListSkeleton />}>
      <VenuesListInner />
    </Suspense>
  );
}
