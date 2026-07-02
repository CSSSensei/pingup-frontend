"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { ParticipantRow } from "@/components/features/participant-row";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { IconArrowLeft, IconPencil } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useDeleteEvent, useEvent } from "@/hooks/useEvents";
import {
  useConfirmParticipant,
  useDeclineParticipant,
  useEventParticipants,
  useKickParticipant,
} from "@/hooks/useParticipants";
import { eventHref, eventSection, type EventSection } from "@/lib/links";
import type { EventParticipant } from "@/types/api";

const SECTION_TEXT: Record<EventSection, { back: string; title: string; list: string }> = {
  games: { back: "К игре", title: "Управление игрой", list: "/games" },
  trainings: { back: "К тренировке", title: "Управление тренировкой", list: "/trainings" },
};

export function ManageEventView({ id, section }: { id: number; section: EventSection }) {
  const router = useRouter();
  const eventQuery = useEvent(id);
  const participantsQuery = useEventParticipants(id);

  const confirm = useConfirmParticipant(id);
  const decline = useDeclineParticipant(id);
  const kick = useKickParticipant(id);
  const remove = useDeleteEvent(id);
  const [kickTarget, setKickTarget] = useState<EventParticipant | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  // Игры и тренировки — одни события; чужой раздел в URL тихо поправляем.
  const event = eventQuery.data;
  const wrongSection = event != null && eventSection(event.event_type) !== section;
  useEffect(() => {
    if (event && wrongSection) router.replace(`${eventHref(event)}/manage`);
  }, [event, wrongSection, router]);

  const text = SECTION_TEXT[section];
  const backHref = `/${section}/${id}`;

  if (participantsQuery.isError) {
    const err = participantsQuery.error;
    const forbidden = err instanceof ApiError && err.status === 403;
    return (
      <Container backHref={backHref} backLabel={text.back}>
        {forbidden ? (
          <EmptyState
            title="Нет доступа"
            description="Управлять событием может только организатор."
          />
        ) : (
          <ErrorState onRetry={() => participantsQuery.refetch()} />
        )}
      </Container>
    );
  }

  const items = participantsQuery.data?.items ?? [];
  const pending = items.filter((p) => p.status === "pending");
  const confirmed = items.filter((p) => p.status === "confirmed");
  const confirmedCount = confirmed.length;
  const isFull = event?.max_participants != null && confirmedCount >= event.max_participants;
  const isCancelled = event?.status === "cancelled";

  const rowBusy = (m: { isPending: boolean; variables?: number }, userId: number) =>
    m.isPending && m.variables === userId;

  return (
    <Container backHref={backHref} backLabel={text.back}>
      <PageHeader
        title={text.title}
        description={event?.title}
        actions={
          <div className="flex items-center gap-2">
            <LinkButton href={`/${section}/${id}/edit`} size="sm" variant="secondary">
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

      {participantsQuery.isPending || wrongSection ? (
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
                          disabled={isFull || rowBusy(decline, p.user_id)}
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
            <h2 className="mb-3 text-sm font-bold text-fg-2">
              Участники · {confirmedCount}
              {event?.max_participants != null ? ` из ${event.max_participants}` : ""}
            </h2>
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
            ? `${kickTarget.profile.display_name} будет удалён из события.`
            : "Участник будет удалён из события."
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

      <ConfirmDialog
        open={cancelOpen}
        title="Отменить событие?"
        message="Подтверждённые участники получат уведомление об отмене. Действие необратимо."
        confirmLabel="Отменить событие"
        destructive
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(undefined, {
            onSuccess: () => {
              toast.success("Событие отменено");
              router.push(text.list);
            },
          })
        }
        onClose={() => setCancelOpen(false)}
      />
    </Container>
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
