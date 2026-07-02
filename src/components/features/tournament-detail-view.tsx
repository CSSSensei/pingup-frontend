"use client";

import Link from "next/link";

import { TournamentDetail } from "@/components/features/tournament-detail";
import { EmptyState, ErrorState } from "@/components/common/states";
import { ApiError } from "@/lib/api/client";
import { IconArrowLeft } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useTournament } from "@/hooks/useTournaments";

export function TournamentDetailView({ slug }: { slug: string }) {
  const query = useTournament(slug);

  return (
    <div className="space-y-4">
      <Link
        href="/tournaments"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        Все турниры
      </Link>

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
