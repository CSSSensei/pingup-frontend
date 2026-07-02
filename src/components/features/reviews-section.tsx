"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ReviewCard } from "@/components/features/review-card";
import { ReviewComposer } from "@/components/features/review-composer";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/ui/star-rating";
import { toast } from "@/components/ui/toast";
import { useAuthStatus, useMe } from "@/hooks/useMe";
import { useDeleteReview, useReviews } from "@/hooks/useReviews";
import type { ReviewTargetType } from "@/lib/enums";
import { reviewsLabel } from "@/lib/venues";
import type { ReviewRead } from "@/types/api";

export function ReviewsSection({
  targetType,
  targetId,
  loginNext,
  title = "Отзывы",
  denormAvg,
  denormCount,
}: {
  targetType: ReviewTargetType;
  targetId: number;
  loginNext: string;
  title?: string;
  // Для зала — точный денорм с бэка; для игрока/тренера считаем из списка.
  denormAvg?: number;
  denormCount?: number;
}) {
  const status = useAuthStatus();
  const { data: me } = useMe();
  const query = useReviews({
    target_type: targetType,
    target_id: targetId,
    sort: "-created_at",
    limit: 100,
  });

  const [composer, setComposer] = useState<{ review?: ReviewRead } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const items = query.data?.items ?? [];
  const myReview = me ? items.find((r) => r.author_id === me.id) : undefined;
  const others = myReview ? items.filter((r) => r.id !== myReview.id) : items;
  const del = useDeleteReview(myReview?.id ?? 0);

  // Для player/coach target_id === user_id → так узнаём свой профиль. Владельца зала клиент не знает.
  const isSelfTarget = targetType !== "venue" && me != null && me.id === targetId;

  const count = denormCount ?? query.data?.total ?? 0;
  const avg =
    denormAvg != null
      ? denormAvg
      : items.length
        ? items.reduce((sum, r) => sum + r.rating, 0) / items.length
        : 0;

  const removeReview = () => {
    del.mutate(undefined, {
      onSuccess: () => {
        setConfirmDelete(false);
        toast.success("Отзыв удалён");
      },
    });
  };

  const composeControl = () => {
    if (isSelfTarget || myReview) return null;
    if (status === "idle" || status === "authenticating") {
      return (
        <Button size="sm" loading disabled>
          Оставить отзыв
        </Button>
      );
    }
    if (status !== "authed") {
      return (
        <LinkButton href={`/login?next=${encodeURIComponent(loginNext)}`} size="sm" variant="secondary">
          Войти, чтобы оставить отзыв
        </LinkButton>
      );
    }
    return (
      <Button size="sm" onClick={() => setComposer({})}>
        Оставить отзыв
      </Button>
    );
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-extrabold text-fg">{title}</h2>
          {count > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <StarRating value={avg} size={15} />
              <span className="text-sm font-bold text-fg">{avg.toFixed(1).replace(".", ",")}</span>
              <span className="text-[13px] font-semibold text-muted">· {reviewsLabel(count)}</span>
            </span>
          )}
        </div>
        {composeControl()}
      </div>

      <div className="mt-4">
        {query.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : query.isError ? (
          <div className="flex flex-col items-start gap-2 py-2">
            <p className="text-sm text-muted">Не удалось загрузить отзывы.</p>
            <Button size="sm" variant="secondary" onClick={() => query.refetch()}>
              Повторить
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="py-2 text-sm text-muted">
            {isSelfTarget
              ? "О вас пока нет отзывов."
              : "Пока нет отзывов — будьте первым, кто оставит."}
          </p>
        ) : (
          <div className="space-y-3">
            {myReview && (
              <ReviewCard
                review={myReview}
                isOwn
                onEdit={() => setComposer({ review: myReview })}
                onDelete={() => setConfirmDelete(true)}
              />
            )}
            {others.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </div>

      {composer && (
        <ReviewComposer
          key={composer.review?.id ?? "new"}
          open
          onClose={() => setComposer(null)}
          targetType={targetType}
          targetId={targetId}
          review={composer.review}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Удалить отзыв?"
        message="Отзыв будет удалён без возможности восстановления."
        confirmLabel="Удалить"
        destructive
        loading={del.isPending}
        onConfirm={removeReview}
        onClose={() => setConfirmDelete(false)}
      />
    </section>
  );
}
