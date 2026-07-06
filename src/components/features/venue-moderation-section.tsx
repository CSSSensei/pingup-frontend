"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  useVenueModEventActions,
  useVenueModEvents,
  useVenueModReviewActions,
  useVenueModReviews,
} from "@/hooks/useMyVenues";
import { formatDateTime } from "@/lib/format";
import type { EventRead, ReviewRead } from "@/types/api";

export function VenueModerationSection({ venueId }: { venueId: number }) {
  return (
    <div className="mt-4 space-y-4 border-t border-border pt-4">
      <h3 className="text-sm font-bold text-fg-2">Модерация контента</h3>
      <EventsBlock venueId={venueId} />
      <ReviewsBlock venueId={venueId} />
    </div>
  );
}

function EventsBlock({ venueId }: { venueId: number }) {
  const query = useVenueModEvents(venueId);
  const actions = useVenueModEventActions(venueId);
  const items = query.data?.items ?? [];

  return (
    <div>
      <p className="mb-1.5 text-xs font-bold tracking-wide text-muted uppercase">События</p>
      {query.isPending ? (
        <Skeleton className="h-16 w-full" />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <p className="py-1 text-sm text-muted">Событий нет.</p>
      ) : (
        <div className="divide-y divide-border">
          {items.map((e) => (
            <EventRow key={e.id} event={e} actions={actions} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventRow({
  event,
  actions,
}: {
  event: EventRead;
  actions: ReturnType<typeof useVenueModEventActions>;
}) {
  const [confirm, setConfirm] = useState(false);
  const deleted = event.deleted_at != null;
  const busy =
    (actions.update.isPending && actions.update.variables?.id === event.id) ||
    (actions.remove.isPending && actions.remove.variables?.id === event.id);

  return (
    <div className="py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-fg">{event.title}</span>
            {!event.is_public && <Badge className="bg-surface-3 text-fg-2">Скрыто</Badge>}
            {deleted && (
              <Badge className="bg-status-cancelled/12 text-status-cancelled">Удалено</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted">{formatDateTime(event.starts_at)}</p>
        </div>
        {!deleted && (
          <div className="flex flex-none items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() =>
                actions.update.mutate(
                  { id: event.id, body: { is_public: !event.is_public } },
                  {
                    onSuccess: () =>
                      toast.success(event.is_public ? "Скрыто" : "Опубликовано"),
                  },
                )
              }
            >
              {event.is_public ? "Скрыть" : "Показать"}
            </Button>
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => setConfirm(true)}>
              Удалить
            </Button>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirm}
        title="Удалить событие?"
        message="Событие будет скрыто и отменено."
        confirmLabel="Удалить"
        destructive
        loading={actions.remove.isPending}
        onConfirm={() =>
          actions.remove.mutate(
            { id: event.id },
            {
              onSuccess: () => {
                toast.success("Событие удалено");
                setConfirm(false);
              },
            },
          )
        }
        onClose={() => setConfirm(false)}
      />
    </div>
  );
}

function ReviewsBlock({ venueId }: { venueId: number }) {
  const query = useVenueModReviews(venueId);
  const actions = useVenueModReviewActions(venueId);
  const items = query.data?.items ?? [];

  return (
    <div>
      <p className="mb-1.5 text-xs font-bold tracking-wide text-muted uppercase">Отзывы</p>
      {query.isPending ? (
        <Skeleton className="h-16 w-full" />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <p className="py-1 text-sm text-muted">Отзывов нет.</p>
      ) : (
        <div className="divide-y divide-border">
          {items.map((r) => (
            <ReviewRow key={r.id} review={r} actions={actions} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewRow({
  review,
  actions,
}: {
  review: ReviewRead;
  actions: ReturnType<typeof useVenueModReviewActions>;
}) {
  const [confirm, setConfirm] = useState(false);
  const deleted = review.deleted_at != null;
  const busy =
    (actions.update.isPending && actions.update.variables?.id === review.id) ||
    (actions.remove.isPending && actions.remove.variables?.id === review.id);

  return (
    <div className="py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-fg">
              {review.author?.display_name ?? `#${review.author_id}`} · {review.rating}★
            </span>
            {review.is_hidden && <Badge className="bg-surface-3 text-fg-2">Скрыт</Badge>}
            {deleted && (
              <Badge className="bg-status-cancelled/12 text-status-cancelled">Удалён</Badge>
            )}
          </div>
          {review.comment && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted">{review.comment}</p>
          )}
        </div>
        {!deleted && (
          <div className="flex flex-none items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() =>
                actions.update.mutate(
                  { id: review.id, body: { is_hidden: !review.is_hidden } },
                  { onSuccess: () => toast.success(review.is_hidden ? "Показан" : "Скрыт") },
                )
              }
            >
              {review.is_hidden ? "Показать" : "Скрыть"}
            </Button>
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => setConfirm(true)}>
              Удалить
            </Button>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirm}
        title="Удалить отзыв?"
        message="Отзыв будет удалён."
        confirmLabel="Удалить"
        destructive
        loading={actions.remove.isPending}
        onConfirm={() =>
          actions.remove.mutate(
            { id: review.id },
            {
              onSuccess: () => {
                toast.success("Отзыв удалён");
                setConfirm(false);
              },
            },
          )
        }
        onClose={() => setConfirm(false)}
      />
    </div>
  );
}
