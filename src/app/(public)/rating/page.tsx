import { LeaderboardView } from "@/components/features/leaderboard-view";
import { PageHeader } from "@/components/common/page-header";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata = {
  title: "Топ игроков в настольный теннис — Смоленск",
  description:
    "Официальный рейтинг настольного тенниса Смоленска по данным теннис67.рф",
};

export default function RatingPage() {
  return (
    <PublicShell className="max-w-5xl">
      <PageHeader
        title="Топ"
        description={`Официальный рейтинг по данным теннис67.рф`}
      />
      <LeaderboardView />
    </PublicShell>
  );
}
