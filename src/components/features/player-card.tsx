import Link from "next/link";

import { Avatar } from "@/components/common/avatar";
import { Badge, LevelBadge } from "@/components/ui/badge";
import { PLAYING_HAND_LABELS } from "@/lib/enums";
import type { ProfilePublic } from "@/types/api";

export function PlayerCard({ player }: { player: ProfilePublic }) {
  const inner = (
    <>
      <Avatar src={player.avatar_url} name={player.display_name} size={48} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-bold text-fg">{player.display_name}</span>
          {player.is_coach && (
            <span className="flex-none rounded-pill bg-fg px-2 py-[2px] text-[10px] font-extrabold tracking-wide text-white">
              ТРЕНЕР
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {player.skill_level && <LevelBadge level={player.skill_level} />}
          {player.playing_hand && <Badge>{PLAYING_HAND_LABELS[player.playing_hand]}</Badge>}
        </div>
        {player.blade && <p className="mt-1.5 truncate text-xs text-muted">{player.blade}</p>}
      </div>

      {player.current_rating != null && (
        <div className="flex-none text-right">
          <div className="text-[22px] leading-none font-extrabold text-fg">
            {player.current_rating}
          </div>
          <div className="mt-1 text-[10px] font-bold tracking-wide text-muted uppercase">
            {player.rating_is_stale ? "неактуально" : "рейтинг"}
          </div>
        </div>
      )}
    </>
  );

  const className =
    "flex items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-card";

  if (!player.slug) {
    return <div className={className}>{inner}</div>;
  }
  return (
    <Link
      href={`/players/${player.slug}`}
      className={`${className} transition-colors hover:border-border-strong`}
    >
      {inner}
    </Link>
  );
}
