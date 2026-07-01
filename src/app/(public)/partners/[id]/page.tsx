import { notFound } from "next/navigation";

import { PartnerRequestDetailView } from "@/components/features/partner-request-detail-view";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata = { title: "Объявление о поиске напарника" };

export default async function PartnerRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requestId = Number(id);
  if (!Number.isInteger(requestId) || requestId <= 0) notFound();

  return (
    <PublicShell>
      <PartnerRequestDetailView id={requestId} />
    </PublicShell>
  );
}
