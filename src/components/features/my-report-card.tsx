import { Badge, ReportStatusBadge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/format";
import { targetLabel } from "@/lib/reports";
import type { ReportRead } from "@/types/api";

// Read-only карточка жалобы для её автора (в отличие от модераторской — без ссылки в админку).
export function MyReportCard({ report }: { report: ReportRead }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge>{targetLabel(report.target_type, report.target_id)}</Badge>
          <ReportStatusBadge status={report.status} />
        </div>
        <span className="flex-none text-xs text-muted">{formatRelative(report.created_at)}</span>
      </div>
      <p className="mt-2 text-sm whitespace-pre-line text-fg-2">{report.reason}</p>
      {report.resolution_note && (
        <div className="mt-3 rounded-md bg-surface-2 p-3">
          <p className="text-xs font-bold text-fg-2">Ответ модератора</p>
          <p className="mt-1 text-sm whitespace-pre-line text-fg-2">{report.resolution_note}</p>
        </div>
      )}
    </article>
  );
}
