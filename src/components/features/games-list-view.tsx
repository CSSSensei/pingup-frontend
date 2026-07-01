"use client";

import { useState } from "react";

import { EventCard } from "@/components/features/event-card";
import { EventFilters } from "@/components/features/event-filters";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { IconPaddle } from "@/components/ui/icons";
import { useEvents } from "@/hooks/useEvents";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import type { EventFilterParams } from "@/types/api";

export function GamesListView() {
  const [filter, setFilter] = useState<EventFilterParams>({
    event_type: "game",
    city_id: SMOLENSK_CITY_ID,
  });
  const query = useEvents(filter);
  const patch = (p: Partial<EventFilterParams>) => setFilter((f) => ({ ...f, ...p }));

  return (
    <div className="space-y-5">
      <EventFilters value={filter} onChange={patch} />

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EmptyState
          icon={<IconPaddle size={34} />}
          title="Пока нет игр"
          description="Здесь появятся ближайшие игры в Смоленске. Загляните позже или создайте свою."
        />
      ) : (
        <div className="space-y-3">
          {query.data.items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
