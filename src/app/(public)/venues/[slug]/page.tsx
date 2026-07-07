import type { Metadata } from "next";

import { VenueDetailView } from "@/components/features/venue-detail-view";
import { PublicShell } from "@/components/layout/public-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: "Зал для настольного тенниса", alternates: { canonical: `/venues/${slug}` } };
}

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <PublicShell>
      <VenueDetailView slug={slug} />
    </PublicShell>
  );
}
