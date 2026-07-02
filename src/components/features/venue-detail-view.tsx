"use client";

import Link from "next/link";

import { VenueDetail } from "@/components/features/venue-detail";
import { EmptyState, ErrorState } from "@/components/common/states";
import { ApiError } from "@/lib/api/client";
import { IconArrowLeft } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useVenue } from "@/hooks/useVenues";

export function VenueDetailView({ slug }: { slug: string }) {
  const query = useVenue(slug);

  return (
    <div className="space-y-4">
      <Link
        href="/venues"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        Все залы
      </Link>

      {query.isPending ? (
        <DetailSkeleton />
      ) : query.isError ? (
        query.error instanceof ApiError && query.error.status === 404 ? (
          <EmptyState title="Зал не найден" description="Возможно, его удалили из каталога." />
        ) : (
          <ErrorState onRetry={() => query.refetch()} />
        )
      ) : (
        <VenueDetail venue={query.data} />
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="mt-3 h-8 w-2/3" />
      <div className="mt-5 space-y-2.5">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-48" />
      </div>
      <Skeleton className="mt-6 h-12 w-full sm:w-48" />
    </div>
  );
}
