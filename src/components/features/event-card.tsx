import Link from "next/link";

import { Badge, GenderBadge, LevelBadge, StatusBadge } from "@/components/ui/badge";
import { IconCheck, IconClock, IconPin, IconUsers } from "@/components/ui/icons";
import { EVENT_TYPE_LABELS } from "@/lib/enums";
import { formatDistance, formatEventWhen } from "@/lib/format";
import { eventHref } from "@/lib/links";
import type { EventRead } from "@/types/api";

export function EventCard({ event }: { event: EventRead }) {
  const slots =
    event.max_participants != null
      ? `${event.participants_count} / ${event.max_participants}`
      : `${event.participants_count}`;

  return (
    <Link
      href={eventHref(event)}
      className="block rounded-lg border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Badge>{EVENT_TYPE_LABELS[event.event_type]}</Badge>
            <StatusBadge status={event.status} />
            {event.is_joined && (
              <span className="inline-flex items-center gap-1 rounded-pill bg-status-confirmed/12 px-[9px] py-[3px] text-xs font-bold text-status-confirmed">
                <IconCheck size={12} /> Вы участвуете
              </span>
            )}
          </div>
          <h3 className="truncate text-[15px] font-bold text-fg">{event.title}</h3>
        </div>
        {event.distance_km != null && (
          <Badge tone="soft">{formatDistance(event.distance_km)}</Badge>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] font-medium text-fg-2">
        <span className="inline-flex items-center gap-1.5">
          <IconClock size={15} className="text-muted" />
          {formatEventWhen(event.starts_at)}
        </span>
        {event.location_text && (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <IconPin size={15} className="flex-none text-muted" />
            <span className="truncate">{event.location_text}</span>
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <IconUsers size={15} className="text-muted" />
          {slots}
        </span>
      </div>

      {(event.min_skill_level || event.max_skill_level || event.gender_restriction) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {event.min_skill_level && <LevelBadge level={event.min_skill_level} />}
          {event.max_skill_level && event.max_skill_level !== event.min_skill_level && (
            <LevelBadge level={event.max_skill_level} />
          )}
          {event.gender_restriction && <GenderBadge gender={event.gender_restriction} />}
        </div>
      )}
    </Link>
  );
}
