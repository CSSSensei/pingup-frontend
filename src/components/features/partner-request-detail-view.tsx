"use client";

import { PartnerRequestDetail } from "@/components/features/partner-request-detail";
import { ReportButton } from "@/components/features/report-button";
import { DetailTopBar } from "@/components/common/detail-top-bar";
import { EmptyState, ErrorState } from "@/components/common/states";
import { ApiError } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { usePartnerRequest } from "@/hooks/usePartners";

export function PartnerRequestDetailView({ id }: { id: number }) {
  const query = usePartnerRequest(id);

  return (
    <div className="space-y-4">
      <DetailTopBar
        backHref="/partners"
        backLabel="Все объявления"
        action={
          query.data && (
            <ReportButton
              targetType="partner_request"
              targetId={query.data.id}
              ownerId={query.data.author_id}
              loginNext={`/partners/${query.data.id}`}
            />
          )
        }
      />

      {query.isPending ? (
        <DetailSkeleton />
      ) : query.isError ? (
        query.error instanceof ApiError && query.error.status === 404 ? (
          <EmptyState
            title="Объявление не найдено"
            description="Возможно, его удалили или закрыли."
          />
        ) : (
          <ErrorState onRetry={() => query.refetch()} />
        )
      ) : (
        <PartnerRequestDetail request={query.data} />
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
      </div>
      <Skeleton className="mt-6 h-12 w-full sm:w-48" />
    </div>
  );
}
