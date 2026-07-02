"use client";

import { notFound } from "next/navigation";
import { use } from "react";

import { ManageTournamentView } from "@/components/features/manage-tournament-view";

export default function ManageTournamentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  if (!slug) notFound();

  return <ManageTournamentView slug={slug} />;
}
