"use client";

import { useState } from "react";

import { DeleteRestoreControls } from "@/components/features/admin/delete-restore-controls";
import { Pager } from "@/components/features/admin/admin-venues-view";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StarRating } from "@/components/ui/star-rating";
import { toast } from "@/components/ui/toast";
import { IconStar } from "@/components/ui/icons";
import { useAdminReviewActions, useAdminReviews } from "@/hooks/useAdmin";
import {
  REVIEW_TARGET_LABELS,
  REVIEW_TARGET_TYPES,
  type ReviewTargetType,
} from "@/lib/enums";
import { formatDate } from "@/lib/format";
import type { AdminReviewFilterParams, ReviewRead } from "@/types/api";

const LIMIT = 30;
type Visibility = "" | "visible" | "hidden";

export function AdminReviewsView() {
  const [target, setTarget] = useState<ReviewTargetType | "">("");
  const [visibility, setVisibility] = useState<Visibility>("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [offset, setOffset] = useState(0);

  const filter: AdminReviewFilterParams = {
    ...(target ? { target_type: target } : {}),
    ...(visibility === "visible" ? { is_hidden: false } : {}),
    ...(visibility === "hidden" ? { is_hidden: true } : {}),
    ...(includeDeleted ? { include_deleted: true } : {}),
    limit: LIMIT,
    offset,
  };

  const query = useAdminReviews(filter);
  const actions = useAdminReviewActions();
  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const reset = () => setOffset(0);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <PageHeader title="Отзывы" description="Скрытие и удаление отзывов" />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Select
          className="max-w-[170px]"
          aria-label="Тип цели"
          value={target}
          onChange={(e) => {
            setTarget(e.target.value as ReviewTargetType | "");
            reset();
          }}
        >
          <option value="">Все цели</option>
          {REVIEW_TARGET_TYPES.map((t) => (
            <option key={t} value={t}>
              {REVIEW_TARGET_LABELS[t]}
            </option>
          ))}
        </Select>
        <Select
          className="max-w-[170px]"
          aria-label="Видимость"
          value={visibility}
          onChange={(e) => {
            setVisibility(e.target.value as Visibility);
            reset();
          }}
        >
          <option value="">Любая видимость</option>
          <option value="visible">Видимые</option>
          <option value="hidden">Скрытые</option>
        </Select>
        <label className="flex items-center gap-2 text-sm font-semibold text-fg-2">
          <Switch
            checked={includeDeleted}
            onCheckedChange={(v) => {
              setIncludeDeleted(v);
              reset();
            }}
          />
          Показывать удалённые
        </label>
      </div>

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon={<IconStar size={32} />} title="Отзывов нет" />
      ) : (
        <>
          <div className="space-y-2.5">
            {items.map((r) => (
              <ReviewRow key={r.id} review={r} actions={actions} />
            ))}
          </div>
          <Pager offset={offset} total={total} onChange={setOffset} limit={LIMIT} />
        </>
      )}
    </div>
  );
}

function ReviewRow({
  review,
  actions,
}: {
  review: ReviewRead;
  actions: ReturnType<typeof useAdminReviewActions>;
}) {
  const deleted = review.deleted_at != null;
  const busy =
    (actions.update.isPending && actions.update.variables?.id === review.id) ||
    (actions.remove.isPending && actions.remove.variables?.id === review.id);
  const authorName = review.author?.display_name ?? `#${review.author_id}`;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <StarRating value={review.rating} size={14} />
            <Badge>{REVIEW_TARGET_LABELS[review.target_type]} #{review.target_id}</Badge>
            {review.is_hidden && <Badge className="bg-surface-3 text-fg-2">Скрыт</Badge>}
            {deleted && (
              <Badge className="bg-status-cancelled/12 text-status-cancelled">Удалён</Badge>
            )}
          </div>
          {review.comment && (
            <p className="mt-1.5 line-clamp-3 text-sm text-fg-2">{review.comment}</p>
          )}
          <p className="mt-1 text-xs text-muted">
            {authorName} · {formatDate(review.created_at)} · #{review.id}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {!deleted && (
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() =>
              actions.update.mutate(
                { id: review.id, body: { is_hidden: !review.is_hidden } },
                {
                  onSuccess: () =>
                    toast.success(review.is_hidden ? "Отзыв показан" : "Отзыв скрыт"),
                },
              )
            }
          >
            {review.is_hidden ? "Показать" : "Скрыть"}
          </Button>
        )}
        <DeleteRestoreControls
          deleted={deleted}
          entity="отзыв"
          busy={busy}
          onSoftDelete={() =>
            actions.remove.mutate(
              { id: review.id },
              { onSuccess: () => toast.success("Отзыв удалён") },
            )
          }
          onHardDelete={() =>
            actions.remove.mutate(
              { id: review.id, hard: true },
              { onSuccess: () => toast.success("Отзыв удалён навсегда") },
            )
          }
        />
      </div>
    </div>
  );
}
