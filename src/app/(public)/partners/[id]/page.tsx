import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PartnerRequestDetailView } from "@/components/features/partner-request-detail-view";
import { PublicShell } from "@/components/layout/public-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: "Объявление о поиске напарника", alternates: { canonical: `/partners/${id}` } };
}

export default async function PartnerRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requestId = Number(id);
  if (!Number.isInteger(requestId) || requestId <= 0) notFound();

  return (
    <PublicShell className="max-w-2xl">
      <PartnerRequestDetailView id={requestId} />
    </PublicShell>
  );
}
