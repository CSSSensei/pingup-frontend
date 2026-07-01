import { notFound } from "next/navigation";

import { EventDetailView } from "@/components/features/event-detail-view";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata = { title: "Игра" };

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId <= 0) notFound();

  return (
    <PublicShell>
      <EventDetailView id={eventId} />
    </PublicShell>
  );
}
