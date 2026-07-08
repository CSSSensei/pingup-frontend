"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { EventDetail } from "@/components/features/event-detail";
import { ReportButton } from "@/components/features/report-button";
import { DetailTopBar } from "@/components/common/detail-top-bar";
import { EmptyState, ErrorState } from "@/components/common/states";
import { ApiError } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/hooks/useEvents";
import { eventHref, eventSection, type EventSection } from "@/lib/links";

const SECTION_TEXT: Record<EventSection, { back: string; notFound: string }> = {
  games: { back: "Все игры", notFound: "Игра не найдена" },
  trainings: { back: "Все тренировки", notFound: "Тренировка не найдена" },
};

export function EventDetailView({ id, section }: { id: number; section: EventSection }) {
  const query = useEvent(id);
  const router = useRouter();

  // Игры и тренировки — одни события; чужой раздел в URL тихо поправляем.
  const event = query.data;
  const wrongSection = event != null && eventSection(event.event_type) !== section;
  useEffect(() => {
    if (event && wrongSection) router.replace(eventHref(event));
  }, [event, wrongSection, router]);

  const text = SECTION_TEXT[section];

  return (
    <div className="space-y-4">
      <DetailTopBar
        backHref={`/${section}`}
        backLabel={text.back}
        action={
          query.data && (
            <ReportButton
              targetType="event"
              targetId={query.data.id}
              ownerId={query.data.organizer_id}
              loginNext={eventHref(query.data)}
            />
          )
        }
      />

      {query.isPending || wrongSection ? (
        <DetailSkeleton />
      ) : query.isError ? (
        query.error instanceof ApiError && query.error.status === 404 ? (
          <EmptyState title={text.notFound} description="Возможно, её удалили или отменили." />
        ) : (
          <ErrorState onRetry={() => query.refetch()} />
        )
      ) : (
        <EventDetail event={query.data} />
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="mt-3 h-8 w-2/3" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-28" />
      </div>
      <Skeleton className="mt-6 h-12 w-full sm:w-48" />
    </div>
  );
}
