import Link from "next/link";

import { Avatar } from "@/components/common/avatar";
import { LevelBadge, PartnerStatusBadge } from "@/components/ui/badge";
import { IconCheck } from "@/components/ui/icons";
import { EVENT_TYPE_LABELS, GENDER_LABELS } from "@/lib/enums";
import { responsesLabel, skillRangeLabel } from "@/lib/partners";
import type { PartnerRequestRead } from "@/types/api";

export function PartnerRequestCard({ request }: { request: PartnerRequestRead }) {
  const author = request.author;

  return (
    <Link
      href={`/partners/${request.id}`}
      className="block rounded-lg border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <PartnerStatusBadge status={request.status} />
          {request.has_responded && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-status-confirmed/12 px-[9px] py-[3px] text-xs font-bold text-status-confirmed">
              <IconCheck size={12} /> Вы откликнулись
            </span>
          )}
        </div>
        <span className="flex-none text-xs font-bold text-muted">
          {responsesLabel(request.responses_count)}
        </span>
      </div>

      <h3 className="mt-2 text-[15px] font-bold text-fg">{request.title}</h3>
      {request.description && (
        <p className="mt-1 line-clamp-2 text-[13.5px] text-fg-2">{request.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] font-medium text-fg-2">
        <span>
          <span className="text-muted">Уровень:</span>{" "}
          {skillRangeLabel(request.desired_skill_min, request.desired_skill_max)}
        </span>
        {request.desired_gender && (
          <span>
            <span className="text-muted">Пол:</span> {GENDER_LABELS[request.desired_gender]}
          </span>
        )}
        {request.event_type && (
          <span>
            <span className="text-muted">Формат:</span> {EVENT_TYPE_LABELS[request.event_type]}
          </span>
        )}
      </div>

      {author && (
        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <Avatar src={author.avatar_url} name={author.display_name} size={28} />
          <span className="truncate text-[13px] font-semibold text-fg">{author.display_name}</span>
          {author.skill_level && <LevelBadge level={author.skill_level} />}
        </div>
      )}
    </Link>
  );
}
