"use client";

import Link from "next/link";

import { Avatar } from "@/components/common/avatar";
import { EmptyState, ErrorState } from "@/components/common/states";
import { LevelBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/useMe";
import { useProfiles } from "@/hooks/useProfiles";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import type { Gender } from "@/lib/enums";
import { cn } from "@/lib/utils";
import type { ProfilePublic } from "@/types/api";

// Золото / серебро / бронза — семантика медалей вне нейтральной токен-палитры.
const MEDALS = ["#caa63d", "#a8adb6", "#c08457"];

export function LeaderboardColumn({
  gender,
  title,
  q,
  className,
}: {
  gender: Gender;
  title: string;
  q: string;
  className?: string;
}) {
  const me = useMe();
  const mySlug = me.data?.profile.slug ?? null;

  const query = useProfiles({
    city_id: SMOLENSK_CITY_ID,
    gender,
    // rating_min отсекает игроков без рейтинга (NULL) — иначе при DESC они всплыли бы вверх.
    rating_min: 1,
    sort: "-current_rating",
    limit: 100,
    ...(q ? { q } : {}),
  });

  return (
    <section className={cn("rounded-lg border border-border bg-surface p-2 shadow-card sm:p-3", className)}>
      <div className="flex items-center justify-between px-2 py-1.5">
        <h2 className="text-sm font-extrabold text-fg">{title}</h2>
        {query.data && <span className="text-xs font-bold text-muted">{query.data.total}</span>}
      </div>

      {query.isPending ? (
        <RowsSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EmptyState
          title="Пусто"
          description={q ? "Никого не нашлось" : "Пока нет игроков с рейтингом"}
          className="border-0 py-10"
        />
      ) : (
        <ol className="flex flex-col gap-0.5">
          {query.data.items.map((p, i) => (
            <LeaderboardRow
              key={p.slug ?? `${p.display_name}-${i}`}
              player={p}
              rank={i + 1}
              me={!!mySlug && p.slug === mySlug}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function LeaderboardRow({
  player,
  rank,
  me,
}: {
  player: ProfilePublic;
  rank: number;
  me: boolean;
}) {
  const medal = rank <= 3 ? MEDALS[rank - 1] : null;

  const body = (
    <>
      <span className="flex w-7 flex-none justify-center">
        {medal ? (
          <span
            className="inline-flex size-6 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
            style={{ background: medal }}
          >
            {rank}
          </span>
        ) : (
          <span className="text-[13px] font-bold text-muted">{rank}</span>
        )}
      </span>

      <Avatar src={player.avatar_url} name={player.display_name} size={34} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold text-fg">{player.display_name}</span>
          {me && (
            <span className="flex-none rounded-pill border border-primary px-1.5 text-[10px] font-extrabold text-primary">
              ВЫ
            </span>
          )}
          {player.is_coach && (
            <span className="flex-none rounded-pill bg-fg px-1.5 text-[10px] font-extrabold text-white">
              ТРЕНЕР
            </span>
          )}
        </div>
        {player.skill_level && (
          <div className="mt-0.5">
            <LevelBadge level={player.skill_level} />
          </div>
        )}
      </div>

      <div className="flex flex-none flex-col items-end leading-tight">
        <span className="text-[15px] font-extrabold text-fg tabular-nums">
          {player.current_rating}
        </span>
        {player.rating_delta_30d != null && player.rating_delta_30d !== 0 && (
          <RatingDelta delta={player.rating_delta_30d} />
        )}
      </div>
    </>
  );

  const cls = "flex items-center gap-3 rounded-md px-2 py-2 transition-colors";

  return (
    <li>
      {player.slug ? (
        <Link
          href={`/players/${player.slug}`}
          className={cn(cls, "hover:bg-surface-2", me && "bg-primary-tint")}
        >
          {body}
        </Link>
      ) : (
        <div className={cn(cls, me && "bg-primary-tint")}>{body}</div>
      )}
    </li>
  );
}

function RatingDelta({ delta }: { delta: number }) {
  const up = delta > 0;
  return (
    <span
      title="Изменение за месяц"
      className={cn(
        "text-[11px] font-bold tabular-nums",
        up ? "text-status-confirmed" : "text-status-declined",
      )}
    >
      {up ? `+${delta}` : `−${Math.abs(delta)}`}
    </span>
  );
}

function RowsSkeleton() {
  return (
    <div className="flex flex-col gap-0.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="size-[34px] rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-10" />
        </div>
      ))}
    </div>
  );
}
