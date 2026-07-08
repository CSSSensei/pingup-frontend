"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ContactLinks } from "@/components/features/contact-links";
import { EquipmentCard } from "@/components/features/equipment-card";
import { ProfileHeaderCard } from "@/components/features/profile-header-card";
import { RatingChart } from "@/components/features/rating-chart";
import { ReviewsSection } from "@/components/features/reviews-section";
import { ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { IconExternalLink, IconRefresh } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { BallSpinner } from "@/components/ui/spinner";
import { useMe } from "@/hooks/useMe";
import {
  useMyProfile,
  useMyRatingHistory,
  useSyncRating,
  useUnlinkTennis67,
} from "@/hooks/useProfiles";
import { formatRelative } from "@/lib/format";
import type { ProfileMe } from "@/types/api";

export function MyProfileView() {
  const query = useMyProfile();
  const { data: me } = useMe();

  if (query.isPending) {
    return (
      <div className="flex justify-center py-16">
        <BallSpinner size={30} />
      </div>
    );
  }
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;

  const profile = query.data;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Мой профиль"
        actions={
          <>
            <LinkButton href={`/players/${profile.slug}`} size="sm" variant="secondary">
              Как видят другие
            </LinkButton>
            <LinkButton href="/profile/edit" size="sm">
              Редактировать
            </LinkButton>
          </>
        }
      />

      <ProfileHeaderCard
        data={{
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
          isCoach: profile.is_coach,
          skillLevel: profile.skill_level,
          gender: profile.gender,
          playingHand: profile.playing_hand,
          birthDate: profile.birth_date,
          currentRating: profile.current_rating,
          ratingStale: profile.rating_is_stale,
        }}
        as="h2"
      />

      <RatingSection profile={profile} />

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

      <ContactLinks telegram={profile.telegram_username} phone={profile.phone} mode="self" />
      {profile.phone && (
        <p className="px-1 text-xs text-muted">
          Телефон {profile.phone_visible ? "виден" : "скрыт"} в публичном профиле · Telegram виден
          всегда. Изменить — в редактировании.
        </p>
      )}

      {me && (
        <ReviewsSection
          targetType="player"
          targetId={me.id}
          loginNext="/profile"
          title={profile.is_coach ? "Отзывы как об игроке" : "Отзывы обо мне"}
        />
      )}
      {me && profile.is_coach && (
        <ReviewsSection
          targetType="coach"
          targetId={me.id}
          loginNext="/profile"
          title="Отзывы как о тренере"
        />
      )}
    </div>
  );
}

function RatingSection({ profile }: { profile: ProfileMe }) {
  const history = useMyRatingHistory();
  const sync = useSyncRating();
  const unlink = useUnlinkTennis67();
  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const linked = !!profile.tennis67_url;

  function onSync() {
    sync.mutate(undefined, {
      onSuccess: (r) =>
        toast.success(r.detail || "Запросили обновление рейтинга — придёт уведомление."),
    });
  }

  function onUnlink() {
    unlink.mutate(undefined, {
      onSuccess: () => {
        toast.success("Профиль теннис67 отвязан");
        setConfirmUnlink(false);
      },
    });
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-fg-2">Рейтинг теннис67</h2>
        {linked && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" loading={sync.isPending} onClick={onSync}>
              <IconRefresh size={15} />
              Обновить
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmUnlink(true)}>
              Отвязать
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmUnlink}
        title="Отвязать теннис67?"
        message="Рейтинг и история сбросятся. Позже профиль можно привязать заново."
        confirmLabel="Отвязать"
        destructive
        loading={unlink.isPending}
        onConfirm={onUnlink}
        onClose={() => setConfirmUnlink(false)}
      />


      {!linked ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted">
            Привяжите профиль теннис67.рф — мы подтянем ваш рейтинг и будем держать его актуальным.
          </p>
          <LinkButton href="/profile/edit" size="sm">
            Привязать теннис67
          </LinkButton>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm text-fg-2">
              {profile.rating_synced_at
                ? `Обновлён ${formatRelative(profile.rating_synced_at)}`
                : "Ещё не синхронизирован — обновится в ближайшее время."}
            </span>
            {profile.rating_is_stale && profile.rating_synced_at && (
              <span className="text-xs font-bold text-status-pending">неактуально</span>
            )}
            {profile.tennis67_url && (
              <a
                href={profile.tennis67_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                Профиль на теннис67 <IconExternalLink size={13} />
              </a>
            )}
          </div>

          {history.isPending ? (
            <Skeleton className="mt-4 h-24 w-full" />
          ) : history.data && history.data.points.length >= 2 ? (
            <div className="mt-4">
              <RatingChart points={history.data.points} currentRating={profile.current_rating} />
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted">
              График появится, когда наберётся несколько замеров рейтинга.
            </p>
          )}
        </>
      )}
    </section>
  );
}
