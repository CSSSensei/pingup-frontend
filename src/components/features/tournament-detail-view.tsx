"use client";

import { TournamentDetail } from "@/components/features/tournament-detail";
import { ReportButton } from "@/components/features/report-button";
import { DetailTopBar } from "@/components/common/detail-top-bar";
import { EmptyState, ErrorState } from "@/components/common/states";
import { ApiError } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useTournament } from "@/hooks/useTournaments";

export function TournamentDetailView({ slug }: { slug: string }) {
  const query = useTournament(slug);

  return (
    <div className="space-y-4">
      <DetailTopBar
        backHref="/tournaments"
        backLabel="Все турниры"
        action={
          query.data && (
            <ReportButton
              targetType="tournament"
              targetId={query.data.id}
              ownerId={query.data.organizer_id}
              loginNext={`/tournaments/${query.data.slug}`}
            />
          )
        }
      />

      {query.isPending ? (
        <DetailSkeleton />
      ) : query.isError ? (
        query.error instanceof ApiError && query.error.status === 404 ? (
          <EmptyState title="Турнир не найден" description="Возможно, его удалили или отменили." />
        ) : (
          <ErrorState onRetry={() => query.refetch()} />
        )
      ) : (
        <TournamentDetail tournament={query.data} />
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="mt-3 h-8 w-2/3" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-28" />
      </div>
      <Skeleton className="mt-6 h-12 w-full sm:w-52" />
    </div>
  );
}
