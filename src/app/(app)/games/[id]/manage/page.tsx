"use client";

import Link from "next/link";
import { use, useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { ParticipantRow } from "@/components/features/participant-row";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/hooks/useEvents";
import {
  useConfirmParticipant,
  useDeclineParticipant,
  useEventParticipants,
  useKickParticipant,
} from "@/hooks/useParticipants";
import type { EventParticipant } from "@/types/api";

export default function ManageEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const eventId = Number(id);

  const eventQuery = useEvent(eventId);
  const participantsQuery = useEventParticipants(eventId);

  const confirm = useConfirmParticipant(eventId);
  const decline = useDeclineParticipant(eventId);
  const kick = useKickParticipant(eventId);
  const [kickTarget, setKickTarget] = useState<EventParticipant | null>(null);

  const backHref = `/games/${eventId}`;

  if (participantsQuery.isError) {
    const err = participantsQuery.error;
    const forbidden = err instanceof ApiError && err.status === 403;
    return (
      <Container backHref={backHref}>
        {forbidden ? (
          <EmptyState
            title="Нет доступа"
            description="Управлять участниками может только организатор события."
          />
        ) : (
          <ErrorState onRetry={() => participantsQuery.refetch()} />
        )}
      </Container>
    );
  }

  const event = eventQuery.data;
  const items = participantsQuery.data?.items ?? [];
  const pending = items.filter((p) => p.status === "pending");
  const confirmed = items.filter((p) => p.status === "confirmed");
  const confirmedCount = confirmed.length;
  const isFull = event?.max_participants != null && confirmedCount >= event.max_participants;

  const rowBusy = (m: { isPending: boolean; variables?: number }, userId: number) =>
    m.isPending && m.variables === userId;

  return (
    <Container backHref={backHref}>
      <PageHeader
        title="Управление игрой"
        description={event?.title}
        actions={
          event?.max_participants != null ? (
            <span className="text-sm font-semibold text-muted">
              Подтверждено {confirmedCount} / {event.max_participants}
            </span>
          ) : undefined
        }
      />

      {participantsQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-bold text-fg-2">Заявки · {pending.length}</h2>
            {pending.length === 0 ? (
              <EmptyState title="Новых заявок нет" description="Здесь появятся игроки, подавшие заявку." />
            ) : (
              <div className="space-y-3">
                {pending.map((p) => (
                  <ParticipantRow
                    key={p.user_id}
                    participant={p}
                    actions={
                      <>
                        <Button
                          size="sm"
                          loading={rowBusy(confirm, p.user_id)}
                          disabled={isFull || decline.isPending}
                          title={isFull ? "Нет свободных мест" : undefined}
                          onClick={() => confirm.mutate(p.user_id)}
                        >
                          Принять
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger"
                          loading={rowBusy(decline, p.user_id)}
                          onClick={() => decline.mutate(p.user_id)}
                        >
                          Отклонить
                        </Button>
                      </>
                    }
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-bold text-fg-2">Участники · {confirmed.length}</h2>
            {confirmed.length === 0 ? (
              <EmptyState title="Пока никого" description="Подтверждённые игроки появятся здесь." />
            ) : (
              <div className="space-y-3">
                {confirmed.map((p) => (
                  <ParticipantRow
                    key={p.user_id}
                    participant={p}
                    actions={
                      p.is_organizer ? (
                        <span className="text-xs font-bold text-muted">Организатор</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger"
                          onClick={() => setKickTarget(p)}
                        >
                          Убрать
                        </Button>
                      )
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <ConfirmDialog
        open={kickTarget != null}
        title="Убрать участника?"
        message={
          kickTarget?.profile?.display_name
            ? `${kickTarget.profile.display_name} будет удалён из игры.`
            : "Участник будет удалён из игры."
        }
        confirmLabel="Убрать"
        destructive
        loading={kick.isPending}
        onConfirm={() => {
          if (!kickTarget) return;
          kick.mutate(kickTarget.user_id, { onSuccess: () => setKickTarget(null) });
        }}
        onClose={() => setKickTarget(null)}
      />
    </Container>
  );
}

function Container({ children, backHref }: { children: React.ReactNode; backHref: string }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        К игре
      </Link>
      {children}
    </div>
  );
}
