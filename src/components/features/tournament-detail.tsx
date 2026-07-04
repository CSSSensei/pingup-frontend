"use client";

import Link from "next/link";

import { Avatar } from "@/components/common/avatar";
import { RegisterButton } from "@/components/features/register-button";
import { ReportButton } from "@/components/features/report-button";
import {
  Badge,
  GenderBadge,
  LevelBadge,
  RatingBadge,
  TournamentStatusBadge,
} from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconCalendar,
  IconClock,
  IconExternalLink,
  IconPin,
  IconSettings,
  IconUsers,
} from "@/components/ui/icons";
import { useMe } from "@/hooks/useMe";
import { useTournamentParticipants } from "@/hooks/useTournaments";
import { useVenues } from "@/hooks/useVenues";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import { formatDate, formatDateTime, formatPrice, formatTime } from "@/lib/format";
import { ratingRangeLabel } from "@/lib/partners";
import { isModerator } from "@/lib/roles";
import { placeLabel, slotsLabel } from "@/lib/tournaments";
import type { ProfilePublic, TournamentParticipantRead, TournamentRead } from "@/types/api";

export function TournamentDetail({ tournament }: { tournament: TournamentRead }) {
  const t = tournament;
  const { data: me } = useMe();
  // Организатору кнопку управления уже даёт RegisterButton — здесь только для «сторонних» модераторов.
  const canModerate = isModerator(me?.role) && me?.id !== t.organizer_id;
  const rating = ratingRangeLabel(t.rating_min, t.rating_max);
  const fee = formatPrice(t.entry_fee);
  const hasRestrictions =
    t.skill_level_min != null ||
    t.skill_level_max != null ||
    rating != null ||
    t.gender_restriction != null ||
    fee != null;

  const venuesQuery = useVenues({ city_id: SMOLENSK_CITY_ID, limit: 100, sort: "name" });
  const venue = t.venue_id != null ? venuesQuery.data?.items.find((v) => v.id === t.venue_id) : undefined;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <TournamentStatusBadge status={t.status} />
          {t.is_official && <Badge className="bg-primary-tint text-primary">Официальный</Badge>}
        </div>
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-fg">{t.title}</h1>

        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Meta icon={<IconCalendar size={17} />} label="Начало">
            {formatDate(t.starts_at)} · {formatTime(t.starts_at)}
          </Meta>
          {t.ends_at && (
            <Meta icon={<IconClock size={17} />} label="Окончание">
              {formatDate(t.ends_at)} · {formatTime(t.ends_at)}
            </Meta>
          )}
          {t.registration_deadline && (
            <Meta icon={<IconClock size={17} />} label="Регистрация до">
              {formatDateTime(t.registration_deadline)}
            </Meta>
          )}
          {venue && (
            <Meta icon={<IconPin size={17} />} label="Место">
              <Link href={`/venues/${venue.slug}`} className="text-primary hover:underline">
                {venue.name}
              </Link>
            </Meta>
          )}
          <Meta icon={<IconUsers size={17} />} label="Участники">
            {slotsLabel(t)}
          </Meta>
        </dl>

        {hasRestrictions && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-4">
            {t.skill_level_min && <LevelBadge level={t.skill_level_min} />}
            {t.skill_level_max && t.skill_level_max !== t.skill_level_min && (
              <LevelBadge level={t.skill_level_max} />
            )}
            {rating && <Badge tone="soft">Рейтинг {rating}</Badge>}
            {t.gender_restriction && <GenderBadge gender={t.gender_restriction} />}
            {fee && <Badge tone="soft">Взнос {fee}</Badge>}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <RegisterButton tournament={t} />
          {canModerate && (
            <Link
              href={`/tournaments/${t.slug}/manage`}
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              <IconSettings size={17} />
              Управлять турниром
            </Link>
          )}
          {t.external_url && (
            <a
              href={t.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              <IconExternalLink size={17} />
              Страница турнира
            </a>
          )}
        </div>
      </div>

      {t.description && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="mb-2 text-sm font-bold text-fg-2">Положение о турнире</h2>
          <p className="text-[15px] whitespace-pre-line text-fg-2">{t.description}</p>
        </section>
      )}

      <ParticipantsSection tournamentId={t.id} />

      <div className="flex justify-end">
        <ReportButton
          targetType="tournament"
          targetId={t.id}
          ownerId={t.organizer_id}
          loginNext={`/tournaments/${t.slug}`}
        />
      </div>
    </div>
  );
}

function ParticipantsSection({ tournamentId }: { tournamentId: number }) {
  const query = useTournamentParticipants(tournamentId);
  const items = query.data?.items ?? [];

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <h2 className="mb-3 text-sm font-bold text-fg-2">
        Участники{query.data ? ` · ${query.data.total}` : ""}
      </h2>
      {query.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">Пока никто не зарегистрировался. Станьте первым!</p>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <ParticipantRow key={p.user_id} participant={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function ParticipantRow({ participant }: { participant: TournamentParticipantRead }) {
  const place = placeLabel(participant.seed, participant.final_place);
  return (
    <div className="flex items-center justify-between gap-3">
      <PlayerRow profile={participant.profile} />
      {place && <span className="flex-none text-xs font-bold text-muted">{place}</span>}
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
    <div className="flex min-w-0 items-center gap-3">
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
    <Link href={`/players/${p.slug}`} className="min-w-0 hover:opacity-80">
      {body}
    </Link>
  ) : (
    body
  );
}
