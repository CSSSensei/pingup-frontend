import type { Metadata } from "next";

import { PlayerDetailView } from "@/components/features/player-detail-view";
import { PublicShell } from "@/components/layout/public-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: "Профиль игрока", alternates: { canonical: `/players/${slug}` } };
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PublicShell>
      <PlayerDetailView slug={slug} />
    </PublicShell>
  );
}
