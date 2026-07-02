import { VenueDetailView } from "@/components/features/venue-detail-view";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata = { title: "Зал для настольного тенниса" };

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <PublicShell>
      <VenueDetailView slug={slug} />
    </PublicShell>
  );
}
