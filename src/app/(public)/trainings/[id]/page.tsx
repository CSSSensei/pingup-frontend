import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventDetailView } from "@/components/features/event-detail-view";
import { PublicShell } from "@/components/layout/public-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: "Тренировка", alternates: { canonical: `/trainings/${id}` } };
}

export default async function TrainingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId <= 0) notFound();

  return (
    <PublicShell>
      <EventDetailView id={eventId} section="trainings" />
    </PublicShell>
  );
}
