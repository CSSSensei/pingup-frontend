import type { ReactNode } from "react";

import { Avatar } from "@/components/common/avatar";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { GENDER_LABELS, PLAYING_HAND_LABELS, type Gender, type PlayingHand, type SkillLevel } from "@/lib/enums";
import { ageLabel } from "@/lib/players";

export interface ProfileHeaderData {
  displayName: string;
  avatarUrl: string | null;
  isCoach: boolean;
  skillLevel: SkillLevel | null;
  gender: Gender | null;
  playingHand: PlayingHand | null;
  birthDate?: string | null;
  currentRating: number | null;
  ratingStale: boolean;
}

export function ProfileHeaderCard({ data, actions }: { data: ProfileHeaderData; actions?: ReactNode }) {
  const age = ageLabel(data.birthDate);

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar src={data.avatarUrl} name={data.displayName} size={76} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-[-0.01em] text-fg">{data.displayName}</h1>
            {data.isCoach && (
              <span className="rounded-pill bg-fg px-2.5 py-[3px] text-[11px] font-extrabold tracking-wide text-white">
                ТРЕНЕР
              </span>
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {data.skillLevel && <LevelBadge level={data.skillLevel} />}
            {data.gender && <Badge>{GENDER_LABELS[data.gender]}</Badge>}
            {age && <Badge>{age}</Badge>}
            {data.playingHand && <Badge>Рука: {PLAYING_HAND_LABELS[data.playingHand]}</Badge>}
          </div>
        </div>

        {data.currentRating != null && (
          <div className="flex w-full flex-none items-center justify-between gap-3 rounded-lg bg-surface-2 px-4 py-2.5 sm:w-auto sm:flex-col sm:justify-center sm:px-5 sm:py-3 sm:text-center">
            <div className="text-[11px] font-bold tracking-wide text-muted uppercase">Рейтинг</div>
            <div className="text-2xl leading-none font-extrabold text-fg sm:my-0.5 sm:text-3xl">
              {data.currentRating}
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold">
              <span
                className="size-1.5 rounded-full"
                style={{
                  background: data.ratingStale
                    ? "var(--color-status-pending)"
                    : "var(--color-status-confirmed)",
                }}
              />
              <span className={data.ratingStale ? "text-status-pending" : "text-status-confirmed"}>
                {data.ratingStale ? "неактуально" : "актуально"}
              </span>
            </span>
          </div>
        )}
      </div>

      {actions && <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">{actions}</div>}
    </div>
  );
}
