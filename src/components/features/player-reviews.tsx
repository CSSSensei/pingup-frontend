"use client";

import { useState } from "react";

import { ReviewsSection } from "@/components/features/reviews-section";
import { cn } from "@/lib/utils";
import type { ProfileDetail } from "@/types/api";

// Тренер может получать отзывы двух видов (о тренере / об игроке) — переключаем табом.
export function PlayerReviews({ profile, slug }: { profile: ProfileDetail; slug: string }) {
  const loginNext = `/players/${slug}`;
  const [tab, setTab] = useState<"coach" | "player">(profile.is_coach ? "coach" : "player");

  if (!profile.is_coach) {
    return (
      <ReviewsSection targetType="player" targetId={profile.user_id} loginNext={loginNext} />
    );
  }

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-lg border border-border bg-surface-2 p-1 text-sm font-bold">
        {(["coach", "player"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded px-3.5 py-1.5 transition-colors",
              tab === key ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg",
            )}
          >
            {key === "coach" ? "О тренере" : "Как об игроке"}
          </button>
        ))}
      </div>
      <ReviewsSection
        key={tab}
        targetType={tab}
        targetId={profile.user_id}
        loginNext={loginNext}
        title={tab === "coach" ? "Отзывы о тренере" : "Отзывы об игроке"}
      />
    </div>
  );
}
