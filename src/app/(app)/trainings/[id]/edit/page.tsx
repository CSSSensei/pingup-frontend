"use client";

import { notFound } from "next/navigation";
import { use } from "react";

import { EventEditView } from "@/components/features/event-edit-view";

export default function EditTrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId <= 0) notFound();

  return <EventEditView id={eventId} section="trainings" />;
}
