import Link from "next/link";

import { Badge, GenderBadge, LevelBadge, TournamentStatusBadge } from "@/components/ui/badge";
import { IconCalendar, IconCheck, IconUsers } from "@/components/ui/icons";
import { GENDER_LABELS } from "@/lib/enums";
import { formatDate } from "@/lib/format";
import { ratingRangeLabel } from "@/lib/partners";
import { slotsLabel } from "@/lib/tournaments";
import type { TournamentRead } from "@/types/api";

export function TournamentCard({ tournament }: { tournament: TournamentRead }) {
  const t = tournament;
  const rating = ratingRangeLabel(t.rating_min, t.rating_max);
  const hasSkill = t.skill_level_min != null || t.skill_level_max != null;

  return (
    <Link
      href={`/tournaments/${t.slug}`}
      className="block rounded-lg border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <TournamentStatusBadge status={t.status} />
        {t.is_official && <Badge className="bg-primary-tint text-primary">Официальный</Badge>}
        {t.is_registered && (
          <span className="inline-flex items-center gap-1 rounded-pill bg-status-confirmed/12 px-[9px] py-[3px] text-xs font-bold text-status-confirmed">
            <IconCheck size={12} /> Вы записаны
          </span>
        )}
      </div>

      <h3 className="mt-2 text-[15px] font-bold text-fg">{t.title}</h3>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] font-medium text-fg-2">
        <span className="inline-flex items-center gap-1.5">
          <IconCalendar size={15} className="text-muted" />
          {formatDate(t.starts_at)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IconUsers size={15} className="text-muted" />
          {slotsLabel(t)}
        </span>
      </div>

      {(hasSkill || rating || t.gender_restriction) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {t.skill_level_min && <LevelBadge level={t.skill_level_min} />}
          {t.skill_level_max && t.skill_level_max !== t.skill_level_min && (
            <LevelBadge level={t.skill_level_max} />
          )}
          {rating && <Badge tone="soft">Рейтинг {rating}</Badge>}
          {t.gender_restriction && <GenderBadge gender={t.gender_restriction} />}
        </div>
      )}

      {!hasSkill && !rating && !t.gender_restriction && (
        <p className="mt-2.5 text-[13px] font-medium text-muted">
          {GENDER_LABELS.all} · без ограничений по уровню
        </p>
      )}
    </Link>
  );
}
