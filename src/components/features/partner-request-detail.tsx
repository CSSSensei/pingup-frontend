"use client";

import Link from "next/link";

import { Avatar } from "@/components/common/avatar";
import { RespondButton } from "@/components/features/respond-button";
import { Badge, LevelBadge, PartnerStatusBadge, RatingBadge } from "@/components/ui/badge";
import { IconUser, IconUsers } from "@/components/ui/icons";
import { EVENT_TYPE_LABELS, GENDER_LABELS } from "@/lib/enums";
import { formatRelative } from "@/lib/format";
import { ratingRangeLabel, responsesLabel, skillRangeLabel } from "@/lib/partners";
import type { PartnerRequestRead } from "@/types/api";

export function PartnerRequestDetail({ request }: { request: PartnerRequestRead }) {
  const author = request.author;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <PartnerStatusBadge status={request.status} />
          <Badge tone="soft">{responsesLabel(request.responses_count)}</Badge>
        </div>
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-fg">{request.title}</h1>
        <p className="mt-1 text-sm text-muted">Опубликовано {formatRelative(request.created_at)}</p>

        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Meta icon={<IconUsers size={17} />} label="Уровень">
            {skillRangeLabel(request.desired_skill_min, request.desired_skill_max)}
          </Meta>
          <Meta icon={<IconUser size={17} />} label="Кого ищут">
            {request.desired_gender ? GENDER_LABELS[request.desired_gender] : "Любой пол"}
          </Meta>
          {ratingRangeLabel(request.desired_rating_min, request.desired_rating_max) && (
            <Meta icon={<IconUsers size={17} />} label="Рейтинг напарника">
              {ratingRangeLabel(request.desired_rating_min, request.desired_rating_max)}
            </Meta>
          )}
          {request.event_type && (
            <Meta icon={<IconUsers size={17} />} label="Тип">
              {EVENT_TYPE_LABELS[request.event_type]}
            </Meta>
          )}
        </dl>

        <div className="mt-5">
          <RespondButton request={request} />
        </div>
      </div>

      {request.description && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="mb-2 text-sm font-bold text-fg-2">Описание</h2>
          <p className="text-[15px] whitespace-pre-line text-fg-2">{request.description}</p>
        </section>
      )}

      {author && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="mb-3 text-sm font-bold text-fg-2">Автор объявления</h2>
          <AuthorRow author={author} />
        </section>
      )}
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

function AuthorRow({ author }: { author: NonNullable<PartnerRequestRead["author"]> }) {
  const body = (
    <div className="flex items-center gap-3">
      <Avatar src={author.avatar_url} name={author.display_name} size={40} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold text-fg">{author.display_name}</span>
          {author.current_rating != null && (
            <RatingBadge rating={author.current_rating} stale={author.rating_is_stale} />
          )}
        </div>
        {author.skill_level && <LevelBadge level={author.skill_level} />}
      </div>
    </div>
  );
  return author.slug ? (
    <Link href={`/players/${author.slug}`} className="block hover:opacity-80">
      {body}
    </Link>
  ) : (
    body
  );
}
