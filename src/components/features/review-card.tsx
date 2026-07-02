import Link from "next/link";

import { Avatar } from "@/components/common/avatar";
import { LevelBadge } from "@/components/ui/badge";
import { IconPencil } from "@/components/ui/icons";
import { StarRating } from "@/components/ui/star-rating";
import { formatDate } from "@/lib/format";
import type { ReviewRead } from "@/types/api";

export function ReviewCard({
  review,
  isOwn = false,
  onEdit,
  onDelete,
}: {
  review: ReviewRead;
  isOwn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const author = review.author;
  const name = author?.display_name ?? "Игрок";

  const identity = (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar src={author?.avatar_url} name={name} size={40} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold text-fg">{name}</span>
          {author?.skill_level && <LevelBadge level={author.skill_level} />}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <StarRating value={review.rating} size={13} />
          <span className="text-xs text-muted">{formatDate(review.created_at)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <article className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        {author?.slug ? (
          <Link href={`/players/${author.slug}`} className="min-w-0 hover:opacity-80">
            {identity}
          </Link>
        ) : (
          <div className="min-w-0">{identity}</div>
        )}
        {isOwn && (
          <span className="flex-none rounded-pill bg-surface-3 px-[9px] py-[3px] text-xs font-bold text-fg-2">
            Ваш отзыв
          </span>
        )}
      </div>

      {review.comment && (
        <p className="mt-3 text-[14px] leading-relaxed whitespace-pre-line text-fg-2">
          {review.comment}
        </p>
      )}

      {isOwn && (onEdit || onDelete) && (
        <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <IconPencil size={14} /> Изменить
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-xs font-bold text-danger hover:underline"
            >
              Удалить
            </button>
          )}
        </div>
      )}
    </article>
  );
}
