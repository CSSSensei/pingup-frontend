"use client";

import Link from "next/link";

import { ContactLinks } from "@/components/features/contact-links";
import { EquipmentCard } from "@/components/features/equipment-card";
import { PlayerReviews } from "@/components/features/player-reviews";
import { ProfileHeaderCard } from "@/components/features/profile-header-card";
import { RatingChart } from "@/components/features/rating-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStatus, useMe } from "@/hooks/useMe";
import { useRatingHistory } from "@/hooks/useProfiles";
import type { ProfileDetail } from "@/types/api";

export function PlayerDetail({ profile, slug }: { profile: ProfileDetail; slug: string }) {
  const status = useAuthStatus();
  const { data: me } = useMe();
  const history = useRatingHistory(slug);

  const isSelf = status === "authed" && me?.profile.slug === slug;
  const contactMode = status !== "authed" ? "guest" : isSelf ? "self" : "authed";

  return (
    <div className="space-y-4">
      <ProfileHeaderCard
        data={{
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
          isCoach: profile.is_coach,
          skillLevel: profile.skill_level,
          gender: profile.gender,
          playingHand: profile.playing_hand,
          age: profile.age,
          currentRating: profile.current_rating,
          ratingStale: profile.rating_is_stale,
          ratingDelta: profile.rating_delta_30d,
        }}
        actions={
          isSelf ? (
            <Link href="/profile" className="text-sm font-bold text-primary hover:underline">
              Это ваш профиль — открыть и редактировать →
            </Link>
          ) : undefined
        }
      />

      {history.isPending ? (
        <div className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-40 w-full" />
        </div>
      ) : history.data && history.data.points.length >= 2 ? (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <RatingChart
            points={history.data.points}
            currentRating={profile.current_rating}
            title="Динамика рейтинга"
          />
        </section>
      ) : null}

      {profile.bio && (
        <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <h2 className="mb-2 text-sm font-bold text-fg-2">О себе</h2>
          <p className="text-[15px] whitespace-pre-line text-fg-2">{profile.bio}</p>
        </section>
      )}

      <EquipmentCard
        data={{
          blade: profile.blade,
          rubberForehand: profile.rubber_forehand,
          rubberBackhand: profile.rubber_backhand,
        }}
      />

      <ContactLinks
        telegram={profile.telegram_username}
        phone={profile.phone}
        mode={contactMode}
        loginNext={`/players/${slug}`}
      />
      {isSelf && (profile.telegram_username || profile.phone) && (
        <p className="px-1 text-xs text-muted">Так ваши контакты видят вошедшие игроки.</p>
      )}

      <PlayerReviews profile={profile} slug={slug} />
    </div>
  );
}
