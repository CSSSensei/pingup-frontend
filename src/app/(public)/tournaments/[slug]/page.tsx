import { notFound } from "next/navigation";

import { TournamentDetailView } from "@/components/features/tournament-detail-view";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata = { title: "Турнир" };

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) notFound();

  return (
    <PublicShell>
      <TournamentDetailView slug={slug} />
    </PublicShell>
  );
}
