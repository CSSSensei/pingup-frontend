import Link from "next/link";

import { Avatar } from "@/components/common/avatar";
import { Badge, GenderBadge, LevelRangeBadge, StatusBadge } from "@/components/ui/badge";
import { IconCheck, IconClock, IconPin, IconUsers } from "@/components/ui/icons";
import { EVENT_FORMAT_LABELS, EVENT_TYPE_LABELS } from "@/lib/enums";
import { formatDistance, formatEventWhen, formatPrice } from "@/lib/format";
import { eventHref } from "@/lib/links";
import type { EventRead } from "@/types/api";

export function EventCard({ event }: { event: EventRead }) {
  const slots =
    event.max_participants != null
      ? `${event.participants_count} / ${event.max_participants}`
      : `${event.participants_count}`;
  const price = formatPrice(event.price);

  return (
    <Link
      href={eventHref(event)}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge status={event.status} />
        <Badge>{EVENT_TYPE_LABELS[event.event_type]}</Badge>
        {event.is_recurring && <Badge tone="soft">↻ повтор</Badge>}
        {event.is_joined && (
          <span className="inline-flex items-center gap-1 rounded-pill bg-status-confirmed/12 px-[9px] py-[3px] text-xs font-bold text-status-confirmed">
            <IconCheck size={12} /> Вы участвуете
          </span>
        )}
        {price && <span className="ml-auto text-sm font-extrabold text-fg">{price}</span>}
      </div>

      <h3 className="line-clamp-2 text-[17px] leading-[1.25] font-extrabold tracking-[-0.01em] text-fg">
        {event.title}
      </h3>

      <div className="flex flex-col gap-1.5 text-[13.5px] font-medium text-fg-2">
        <div className="flex items-center gap-2">
          <IconClock size={16} className="flex-none text-muted" />
          {formatEventWhen(event.starts_at)}
        </div>
        {event.location_text && (
          <div className="flex min-w-0 items-center gap-2">
            <IconPin size={16} className="flex-none text-muted" />
            {/* location_text = "Зал · адрес" при выбранном зале (event-form) — в карточке только название */}
            <span className="min-w-0 truncate">{event.location_text.split(" · ")[0]}</span>
            {event.distance_km != null && (
              <Badge tone="soft">{formatDistance(event.distance_km)}</Badge>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          <IconUsers size={16} className="flex-none text-muted" />
          {slots}
        </div>
        {event.organizer && (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar
              src={event.organizer.avatar_url}
              name={event.organizer.display_name}
              size={18}
            />
            <span className="min-w-0 truncate">{event.organizer.display_name}</span>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        <LevelRangeBadge min={event.min_skill_level} max={event.max_skill_level} />
        {event.gender_restriction && <GenderBadge gender={event.gender_restriction} />}
        <Badge>{EVENT_FORMAT_LABELS[event.event_format]}</Badge>
      </div>
    </Link>
  );
}
