"use client";

import Link from "next/link";
import { use } from "react";

import { VenueForm } from "@/components/features/venue-form";
import { EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { ApiError } from "@/lib/api/client";
import { IconArrowLeft } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/useMe";
import { useVenue } from "@/hooks/useVenues";
import { isModerator } from "@/lib/roles";

export default function EditVenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const query = useVenue(slug);
  const { data: me } = useMe();
  const venue = query.data;
  const canEdit = isModerator(me?.role);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href={`/venues/${slug}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        К залу
      </Link>

      {query.isPending || (venue && !me) ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : query.isError ? (
        query.error instanceof ApiError && query.error.status === 404 ? (
          <EmptyState title="Зал не найден" description="Возможно, его удалили из каталога." />
        ) : (
          <ErrorState onRetry={() => query.refetch()} />
        )
      ) : !canEdit ? (
        <EmptyState title="Нет доступа" description="Редактировать зал может только модератор." />
      ) : venue ? (
        <>
          <PageHeader title="Редактирование зала" description={venue.name} />
          <VenueForm venue={venue} />
        </>
      ) : null}
    </div>
  );
}
