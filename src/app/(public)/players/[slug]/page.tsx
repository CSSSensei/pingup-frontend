import { PlayerDetailView } from "@/components/features/player-detail-view";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata = { title: "Профиль игрока" };

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PublicShell>
      <PlayerDetailView slug={slug} />
    </PublicShell>
  );
}
