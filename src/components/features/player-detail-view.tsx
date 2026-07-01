"use client";

import Link from "next/link";

import { PlayerDetail } from "@/components/features/player-detail";
import { EmptyState, ErrorState } from "@/components/common/states";
import { ApiError } from "@/lib/api/client";
import { IconArrowLeft } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/useProfiles";

export function PlayerDetailView({ slug }: { slug: string }) {
  const query = useProfile(slug);

  return (
    <div className="space-y-4">
      <Link
        href="/players"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        Все игроки
      </Link>

      {query.isPending ? (
        <DetailSkeleton />
      ) : query.isError ? (
        query.error instanceof ApiError && query.error.status === 404 ? (
          <EmptyState title="Игрок не найден" description="Возможно, профиль удалён или скрыт." />
        ) : (
          <ErrorState onRetry={() => query.refetch()} />
        )
      ) : (
        <PlayerDetail profile={query.data} slug={slug} />
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-[76px] rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-3 h-5 w-56" />
        </div>
      </div>
    </div>
  );
}
