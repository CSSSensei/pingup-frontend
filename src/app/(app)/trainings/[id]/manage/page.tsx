"use client";

import { notFound } from "next/navigation";
import { use } from "react";

import { ManageEventView } from "@/components/features/manage-event-view";

export default function ManageTrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId <= 0) notFound();

  return <ManageEventView id={eventId} section="trainings" />;
}
