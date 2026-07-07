import Link from "next/link";

import { Avatar } from "@/components/common/avatar";
import { LevelBadge, PartnerStatusBadge } from "@/components/ui/badge";
import { IconCheck } from "@/components/ui/icons";
import { EVENT_TYPE_LABELS, GENDER_LABELS } from "@/lib/enums";
import { ratingRangeLabel, responsesLabel, skillRangeLabel } from "@/lib/partners";
import type { PartnerRequestRead } from "@/types/api";

export function PartnerRequestCard({ request }: { request: PartnerRequestRead }) {
  const author = request.author;

  return (
    <Link
      href={`/partners/${request.id}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <PartnerStatusBadge status={request.status} />
        {request.has_responded && (
          <span className="inline-flex items-center gap-1 rounded-pill bg-status-confirmed/12 px-[9px] py-[3px] text-xs font-bold text-status-confirmed">
            <IconCheck size={12} /> Вы откликнулись
          </span>
        )}
      </div>

      <div>
        <h3 className="line-clamp-2 text-[17px] leading-[1.25] font-extrabold tracking-[-0.01em] text-fg">
          {request.title}
        </h3>
        {request.description && (
          <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-[1.5] text-fg-2">
            {request.description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 text-[13.5px] font-medium text-fg-2">
        <div>
          <span className="text-muted">Уровень:</span>{" "}
          {skillRangeLabel(request.desired_skill_min, request.desired_skill_max)}
        </div>
        {request.desired_gender && (
          <div>
            <span className="text-muted">Пол:</span> {GENDER_LABELS[request.desired_gender]}
          </div>
        )}
        {ratingRangeLabel(request.desired_rating_min, request.desired_rating_max) && (
          <div>
            <span className="text-muted">Рейтинг:</span>{" "}
            {ratingRangeLabel(request.desired_rating_min, request.desired_rating_max)}
          </div>
        )}
        {request.event_type && (
          <div>
            <span className="text-muted">Формат:</span> {EVENT_TYPE_LABELS[request.event_type]}
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
        {author ? (
          <>
            <Avatar src={author.avatar_url} name={author.display_name} size={28} />
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-fg">
              {author.display_name}
            </span>
            {author.skill_level && <LevelBadge level={author.skill_level} />}
          </>
        ) : (
          <span className="flex-1" />
        )}
        <span className="flex-none text-xs font-bold text-muted">
          {responsesLabel(request.responses_count)}
        </span>
      </div>
    </Link>
  );
}
