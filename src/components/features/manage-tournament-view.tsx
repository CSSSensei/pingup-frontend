"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/components/common/avatar";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { LevelBadge, RatingBadge, TournamentStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { IconArrowLeft, IconPencil } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useMe } from "@/hooks/useMe";
import {
  useDeleteTournament,
  useTournament,
  useTournamentParticipants,
  useUpdateTournament,
} from "@/hooks/useTournaments";
import { ApiError } from "@/lib/api/client";
import {
  PARTICIPANT_STATUS_BADGE,
  PARTICIPANT_STATUS_LABELS,
  type TournamentStatus,
} from "@/lib/enums";
import { cn } from "@/lib/utils";
import { placeLabel } from "@/lib/tournaments";
import type { TournamentParticipantRead } from "@/types/api";

const NEXT_ACTIONS: Record<TournamentStatus, { status: TournamentStatus; label: string }[]> = {
  announced: [{ status: "registration_open", label: "Открыть регистрацию" }],
  registration_open: [
    { status: "registration_closed", label: "Закрыть регистрацию" },
    { status: "in_progress", label: "Начать турнир" },
  ],
  registration_closed: [
    { status: "registration_open", label: "Открыть снова" },
    { status: "in_progress", label: "Начать турнир" },
  ],
  in_progress: [{ status: "completed", label: "Завершить турнир" }],
  completed: [],
  cancelled: [],
};

export function ManageTournamentView({ slug }: { slug: string }) {
  const router = useRouter();
  const tournamentQuery = useTournament(slug);
  const { data: me } = useMe();
  const tournament = tournamentQuery.data;

  const update = useUpdateTournament(tournament?.id ?? 0, slug);
  const remove = useDeleteTournament(tournament?.id ?? 0, slug);
  const participantsQuery = useTournamentParticipants(tournament?.id ?? 0, tournament != null);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (tournamentQuery.isError) {
    const notFound =
      tournamentQuery.error instanceof ApiError && tournamentQuery.error.status === 404;
    return (
      <Container backHref="/tournaments" backLabel="К турнирам">
        {notFound ? (
          <EmptyState title="Турнир не найден" description="Возможно, его удалили или отменили." />
        ) : (
          <ErrorState onRetry={() => tournamentQuery.refetch()} />
        )}
      </Container>
    );
  }

  const backHref = `/tournaments/${slug}`;

  if (tournamentQuery.isPending || !me) {
    return (
      <Container backHref={backHref} backLabel="К турниру">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="mt-3 h-24 w-full" />
      </Container>
    );
  }

  const isOrganizer = tournament!.organizer_id != null && tournament!.organizer_id === me.id;
  if (!isOrganizer) {
    return (
      <Container backHref={backHref} backLabel="К турниру">
        <EmptyState title="Нет доступа" description="Управлять турниром может только организатор." />
      </Container>
    );
  }

  const t = tournament!;
  const isCancelled = t.status === "cancelled";
  const actions = NEXT_ACTIONS[t.status];
  const items = participantsQuery.data?.items ?? [];

  const setStatus = (status: TournamentStatus) =>
    update.mutate(
      { status },
      { onSuccess: () => toast.success("Статус турнира обновлён") },
    );

  return (
    <Container backHref={backHref} backLabel="К турниру">
      <PageHeader
        title="Управление турниром"
        description={t.title}
        actions={
          <div className="flex items-center gap-2">
            <LinkButton href={`/tournaments/${slug}/edit`} size="sm" variant="secondary">
              <IconPencil size={15} />
              Редактировать
            </LinkButton>
            {!isCancelled && (
              <Button
                size="sm"
                variant="ghost"
                className="text-danger"
                onClick={() => setCancelOpen(true)}
              >
                Отменить
              </Button>
            )}
          </div>
        }
      />

      <section className="mb-6 rounded-lg border border-border bg-surface p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-fg-2">Статус:</span>
          <TournamentStatusBadge status={t.status} />
        </div>
        {actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((a) => (
              <Button
                key={a.status}
                size="sm"
                variant={a.status === "registration_open" ? "primary" : "secondary"}
                loading={update.isPending && update.variables?.status === a.status}
                disabled={update.isPending}
                onClick={() => setStatus(a.status)}
              >
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-fg-2">
          Участники{participantsQuery.data ? ` · ${participantsQuery.data.total}` : ""}
          {t.max_participants != null ? ` из ${t.max_participants}` : ""}
        </h2>
        {participantsQuery.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Пока никто не зарегистрировался"
            description="Как только откроете регистрацию и игроки запишутся, они появятся здесь."
          />
        ) : (
          <div className="space-y-3">
            {items.map((p) => (
              <ParticipantRow key={p.user_id} participant={p} />
            ))}
          </div>
        )}
        <p className="mt-4 text-[13px] text-muted">
          Посев и итоговые места проставляет администратор — они появятся у участников
          автоматически.
        </p>
      </section>

      <ConfirmDialog
        open={cancelOpen}
        title="Отменить турнир?"
        message="Турнир будет отменён и скрыт из каталога. Это действие необратимо."
        confirmLabel="Отменить турнир"
        destructive
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(undefined, {
            onSuccess: () => {
              toast.success("Турнир отменён");
              router.push("/tournaments");
            },
          })
        }
        onClose={() => setCancelOpen(false)}
      />
    </Container>
  );
}

function ParticipantRow({ participant: p }: { participant: TournamentParticipantRead }) {
  const profile = p.profile;
  const name = profile?.display_name ?? "Игрок";
  const place = placeLabel(p.seed, p.final_place);

  const identity = (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar src={profile?.avatar_url} name={name} size={42} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold text-fg">{name}</span>
          {profile?.current_rating != null && (
            <RatingBadge rating={profile.current_rating} stale={profile.rating_is_stale} />
          )}
        </div>
        {profile?.skill_level && <LevelBadge level={profile.skill_level} />}
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4">
      {profile?.slug ? (
        <Link href={`/players/${profile.slug}`} className="min-w-0 flex-1 hover:opacity-80">
          {identity}
        </Link>
      ) : (
        <div className="min-w-0 flex-1">{identity}</div>
      )}
      <div className="flex flex-none items-center gap-2">
        {place && <span className="text-xs font-bold text-muted">{place}</span>}
        <span
          className={cn(
            "inline-flex items-center rounded-pill px-[9px] py-[3px] text-xs font-bold",
            PARTICIPANT_STATUS_BADGE[p.status],
          )}
        >
          {PARTICIPANT_STATUS_LABELS[p.status]}
        </span>
      </div>
    </div>
  );
}

function Container({
  children,
  backHref,
  backLabel,
}: {
  children: React.ReactNode;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        {backLabel}
      </Link>
      {children}
    </div>
  );
}
