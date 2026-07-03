"use client";

import Link from "next/link";

import { Avatar } from "@/components/common/avatar";
import { JoinButton } from "@/components/features/join-button";
import { ReportButton } from "@/components/features/report-button";
import { Badge, GenderBadge, LevelBadge, RatingBadge, StatusBadge } from "@/components/ui/badge";
import { IconCalendar, IconClock, IconPin, IconUsers } from "@/components/ui/icons";
import { EVENT_FORMAT_LABELS, EVENT_TYPE_LABELS } from "@/lib/enums";
import { formatDate, formatDistance, formatPrice, formatTimeRange } from "@/lib/format";
import { eventHref } from "@/lib/links";
import type { EventRead, ProfilePublic } from "@/types/api";

export function EventDetail({ event }: { event: EventRead }) {
  const organizer = event.participants?.find((p) => p.is_organizer) ?? null;
  const confirmed = event.participants?.filter((p) => p.status === "confirmed" && !p.is_organizer) ?? [];
  const price = formatPrice(event.price);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Badge>{EVENT_TYPE_LABELS[event.event_type]}</Badge>
          <Badge tone="soft">{EVENT_FORMAT_LABELS[event.event_format]}</Badge>
          <StatusBadge status={event.status} />
          {event.distance_km != null && <Badge tone="soft">{formatDistance(event.distance_km)}</Badge>}
        </div>
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-fg">{event.title}</h1>

        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Meta icon={<IconCalendar size={17} />} label="Дата">
            {formatDate(event.starts_at)}
          </Meta>
          <Meta icon={<IconClock size={17} />} label="Время">
            {formatTimeRange(event.starts_at, event.ends_at)}
          </Meta>
          {event.location_text && (
            <Meta icon={<IconPin size={17} />} label="Место">
              {event.location_text}
            </Meta>
          )}
          <Meta icon={<IconUsers size={17} />} label="Участники">
            {event.max_participants != null
              ? `${event.participants_count} из ${event.max_participants}`
              : `${event.participants_count}`}
          </Meta>
        </dl>

        {(event.min_skill_level || event.max_skill_level || event.gender_restriction || price) && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-4">
            {event.min_skill_level && <LevelBadge level={event.min_skill_level} />}
            {event.max_skill_level && event.max_skill_level !== event.min_skill_level && (
              <LevelBadge level={event.max_skill_level} />
            )}
            {event.gender_restriction && <GenderBadge gender={event.gender_restriction} />}
            {price && <Badge tone="soft">{price}</Badge>}
          </div>
        )}

        <div className="mt-5">
          <JoinButton event={event} />
        </div>
      </div>

      {event.description && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="mb-2 text-sm font-bold text-fg-2">Описание</h2>
          <p className="text-[15px] whitespace-pre-line text-fg-2">{event.description}</p>
        </section>
      )}

      {event.coach && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="mb-3 text-sm font-bold text-fg-2">Тренер</h2>
          <PlayerRow profile={event.coach} />
        </section>
      )}

      {organizer && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="mb-3 text-sm font-bold text-fg-2">Организатор</h2>
          <PlayerRow profile={organizer.profile} />
        </section>
      )}

      {confirmed.length > 0 && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="mb-3 text-sm font-bold text-fg-2">
            Участники · {confirmed.length}
          </h2>
          <div className="space-y-3">
            {confirmed.map((p) => (
              <PlayerRow key={p.user_id} profile={p.profile} />
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-end">
        <ReportButton
          targetType="event"
          targetId={event.id}
          ownerId={event.organizer_id}
          loginNext={eventHref(event)}
        />
      </div>
    </div>
  );
}

function Meta({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-muted">{icon}</span>
      <div>
        <dt className="text-xs font-semibold text-muted">{label}</dt>
        <dd className="text-[15px] font-semibold text-fg">{children}</dd>
      </div>
    </div>
  );
}

function PlayerRow({ profile: p }: { profile: ProfilePublic | null }) {
  const name = p?.display_name ?? "Игрок";
  const body = (
    <div className="flex items-center gap-3">
      <Avatar src={p?.avatar_url} name={name} size={40} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold text-fg">{name}</span>
          {p?.current_rating != null && (
            <RatingBadge rating={p.current_rating} stale={p.rating_is_stale} />
          )}
        </div>
        {p?.skill_level && <LevelBadge level={p.skill_level} />}
      </div>
    </div>
  );
  return p?.slug ? (
    <Link href={`/players/${p.slug}`} className="block hover:opacity-80">
      {body}
    </Link>
  ) : (
    body
  );
}
