import { LeaderboardView } from "@/components/features/leaderboard-view";
import { PageHeader } from "@/components/common/page-header";
import { PublicShell } from "@/components/layout/public-shell";
import { CITY_NAME } from "@/lib/constants";

export const metadata = {
  title: "Рейтинг игроков в настольный теннис — Смоленск",
  description:
    "Официальный рейтинг настольного тенниса Смоленска по данным теннис67.рф — ранжированные списки мужчин и женщин.",
};

export default function RatingPage() {
  return (
    <PublicShell className="max-w-5xl">
      <PageHeader
        title="Рейтинг"
        description={`Официальный рейтинг настольного тенниса · ${CITY_NAME} · по данным теннис67.рф`}
      />
      <LeaderboardView />
    </PublicShell>
  );
}
