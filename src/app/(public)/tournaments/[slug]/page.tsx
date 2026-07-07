import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TournamentDetailView } from "@/components/features/tournament-detail-view";
import { PublicShell } from "@/components/layout/public-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: "Турнир", alternates: { canonical: `/tournaments/${slug}` } };
}

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
