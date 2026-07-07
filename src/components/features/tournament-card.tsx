import Link from "next/link";

import { Badge, GenderBadge, LevelRangeBadge, TournamentStatusBadge } from "@/components/ui/badge";
import { IconCalendar, IconCheck, IconClock, IconShieldCheck, IconUsers } from "@/components/ui/icons";
import { formatDateTime, formatEventWhen, formatPrice } from "@/lib/format";
import { ratingRangeLabel } from "@/lib/partners";
import { slotsLabel } from "@/lib/tournaments";
import type { TournamentRead } from "@/types/api";

export function TournamentCard({ tournament }: { tournament: TournamentRead }) {
  const t = tournament;
  const rating = ratingRangeLabel(t.rating_min, t.rating_max);
  const fee = formatPrice(t.entry_fee);
  const hasTags =
    t.skill_level_min != null ||
    t.skill_level_max != null ||
    rating != null ||
    t.gender_restriction != null;

  return (
    <Link
      href={`/tournaments/${t.slug}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <TournamentStatusBadge status={t.status} />
        {t.is_official && (
          <Badge className="bg-primary-tint text-primary">
            <IconShieldCheck size={12} /> Официальный
          </Badge>
        )}
        {t.is_registered && (
          <span className="inline-flex items-center gap-1 rounded-pill bg-status-confirmed/12 px-[9px] py-[3px] text-xs font-bold text-status-confirmed">
            <IconCheck size={12} /> Вы записаны
          </span>
        )}
        {fee && <span className="ml-auto text-sm font-extrabold text-fg">{fee}</span>}
      </div>

      <h3 className="line-clamp-2 text-[17px] leading-[1.25] font-extrabold tracking-[-0.01em] text-fg">
        {t.title}
      </h3>

      {t.description && (
        <p className="line-clamp-2 text-[13.5px] leading-[1.5] text-fg-2">{t.description}</p>
      )}

      <div className="flex flex-col gap-1.5 text-[13.5px] font-medium text-fg-2">
        <div className="flex items-center gap-2">
          <IconCalendar size={16} className="flex-none text-muted" />
          {formatEventWhen(t.starts_at)}
        </div>
        {t.registration_deadline && (
          <div className="flex items-center gap-2">
            <IconClock size={16} className="flex-none text-muted" />
            Регистрация до {formatDateTime(t.registration_deadline)}
          </div>
        )}
        <div className="flex items-center gap-2">
          <IconUsers size={16} className="flex-none text-muted" />
          {slotsLabel(t)}
        </div>
      </div>

      {hasTags && (
        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          <LevelRangeBadge min={t.skill_level_min} max={t.skill_level_max} />
          {rating && <Badge tone="soft">Рейтинг {rating}</Badge>}
          {t.gender_restriction && <GenderBadge gender={t.gender_restriction} />}
        </div>
      )}
    </Link>
  );
}
