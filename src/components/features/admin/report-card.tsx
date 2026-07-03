import Link from "next/link";

import { Badge, ReportStatusBadge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/format";
import { reporterLabel, targetLabel } from "@/lib/reports";
import type { ReportRead } from "@/types/api";

export function ReportCard({ report }: { report: ReportRead }) {
  return (
    <Link
      href={`/admin/reports/${report.id}`}
      className="block rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge>{targetLabel(report.target_type, report.target_id)}</Badge>
          <ReportStatusBadge status={report.status} />
        </div>
        <span className="flex-none text-xs text-muted">{formatRelative(report.created_at)}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-fg-2">{report.reason}</p>
      <p className="mt-2 text-xs text-muted">
        {reporterLabel(report.reporter_id)} · жалоба #{report.id}
      </p>
    </Link>
  );
}
