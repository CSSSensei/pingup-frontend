import Link from "next/link";
import type { ReactNode } from "react";

import { Avatar } from "@/components/common/avatar";
import { ContactChips } from "@/components/features/contact-chips";
import { LevelBadge, RatingBadge } from "@/components/ui/badge";
import { PARTICIPANT_STATUS_BADGE, PARTICIPANT_STATUS_LABELS } from "@/lib/enums";
import { cn } from "@/lib/utils";
import type { EventParticipant } from "@/types/api";

export function ParticipantRow({
  participant,
  showStatus = false,
  actions,
}: {
  participant: EventParticipant;
  showStatus?: boolean;
  actions?: ReactNode;
}) {
  const p = participant.profile;
  const name = p?.display_name ?? "Игрок";

  const identity = (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar src={p?.avatar_url} name={name} size={42} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold text-fg">{name}</span>
          {p?.current_rating != null && (
            <RatingBadge rating={p.current_rating} stale={p.rating_is_stale} />
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {p?.skill_level && <LevelBadge level={p.skill_level} />}
          {showStatus && (
            <span
              className={cn(
                "rounded-pill px-[9px] py-[3px] text-xs font-bold",
                PARTICIPANT_STATUS_BADGE[participant.status],
              )}
            >
              {PARTICIPANT_STATUS_LABELS[participant.status]}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        {p?.slug ? (
          <Link href={`/players/${p.slug}`} className="min-w-0 flex-1 hover:opacity-80">
            {identity}
          </Link>
        ) : (
          <div className="min-w-0 flex-1">{identity}</div>
        )}
        {actions && <div className="flex flex-none items-center gap-2">{actions}</div>}
      </div>
      <ContactChips
        telegram={participant.telegram_username}
        phone={participant.phone}
        className="mt-2.5 pl-[54px]"
      />
    </div>
  );
}
