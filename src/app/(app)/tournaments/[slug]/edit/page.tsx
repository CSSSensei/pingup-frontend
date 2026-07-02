"use client";

import { notFound } from "next/navigation";
import { use } from "react";

import { TournamentEditView } from "@/components/features/tournament-edit-view";

export default function EditTournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  if (!slug) notFound();

  return <TournamentEditView slug={slug} />;
}
