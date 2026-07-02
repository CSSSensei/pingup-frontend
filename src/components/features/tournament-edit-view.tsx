"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { TournamentForm } from "@/components/features/tournament-form";
import { EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { ApiError } from "@/lib/api/client";
import { IconArrowLeft } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useMe } from "@/hooks/useMe";
import { useTournament } from "@/hooks/useTournaments";

export function TournamentEditView({ slug }: { slug: string }) {
  const router = useRouter();
  const query = useTournament(slug);
  const { data: me } = useMe();

  const tournament = query.data;
  const backHref = `/tournaments/${slug}/manage`;
  const notOrganizer =
    tournament != null && me != null && tournament.organizer_id !== me.id;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        К управлению
      </Link>

      {query.isPending || (tournament && !me) ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : query.isError ? (
        query.error instanceof ApiError && query.error.status === 404 ? (
          <EmptyState title="Турнир не найден" description="Возможно, его удалили или отменили." />
        ) : (
          <ErrorState onRetry={() => query.refetch()} />
        )
      ) : notOrganizer ? (
        <EmptyState title="Нет доступа" description="Редактировать турнир может только организатор." />
      ) : tournament ? (
        <>
          <PageHeader title="Редактирование турнира" description={tournament.title} />
          <TournamentForm
            initial={tournament}
            onSaved={(saved) => {
              toast.success("Изменения сохранены");
              router.push(`/tournaments/${saved.slug}`);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
