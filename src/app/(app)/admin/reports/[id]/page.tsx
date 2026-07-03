"use client";

import { notFound } from "next/navigation";
import { use } from "react";

import { RoleGuard } from "@/components/auth/role-guard";
import { ReportDetailView } from "@/components/features/admin/report-detail-view";

export default function AdminReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const reportId = Number(id);
  if (!Number.isInteger(reportId) || reportId <= 0) notFound();

  return (
    <RoleGuard min="moderator">
      <ReportDetailView id={reportId} />
    </RoleGuard>
  );
}
