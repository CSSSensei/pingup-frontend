"use client";

import Link from "next/link";
import { useState } from "react";

import { ApiError } from "@/lib/api/client";
import { Badge, ReportStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { LinkButton } from "@/components/ui/link-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { EmptyState, ErrorState } from "@/components/common/states";
import { IconArrowLeft, IconExternalLink } from "@/components/ui/icons";
import { useReport, useResolveReport } from "@/hooks/useReports";
import {
  REPORT_RESOLVE_STATUSES,
  REPORT_STATUS_LABELS,
  type ReportResolveStatus,
} from "@/lib/enums";
import { formatDateTime } from "@/lib/format";
import { reporterLabel, snapshotRows, snapshotTargetLink, targetLabel } from "@/lib/reports";
import type { ReportDetail } from "@/types/api";

export function ReportDetailView({ id }: { id: number }) {
  const query = useReport(id);

  const backLink = (
    <Link
      href="/admin/reports"
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-fg-2 hover:text-fg"
    >
      <IconArrowLeft size={16} /> К жалобам
    </Link>
  );

  if (query.isPending) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
        {backLink}
        <Skeleton className="h-40 w-full" />
        <Skeleton className="mt-3 h-32 w-full" />
      </div>
    );
  }

  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.status === 404;
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
        {backLink}
        {notFound ? (
          <EmptyState
            title="Жалоба не найдена"
            description="Возможно, её удалили."
            action={
              <LinkButton href="/admin/reports" variant="secondary" size="sm">
                К списку
              </LinkButton>
            }
          />
        ) : (
          <ErrorState onRetry={() => query.refetch()} />
        )}
      </div>
    );
  }

  const report = query.data;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      {backLink}

      <div className="space-y-4">
        <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge>{targetLabel(report.target_type, report.target_id)}</Badge>
              <ReportStatusBadge status={report.status} />
            </div>
            <span className="text-xs text-muted">жалоба #{report.id}</span>
          </div>
          <p className="mt-3 text-sm text-muted">
            {reporterLabel(report.reporter_id)} · {formatDateTime(report.created_at)}
          </p>
          <h2 className="mt-4 text-sm font-bold text-fg-2">Причина</h2>
          <p className="mt-1 text-[15px] whitespace-pre-line text-fg">{report.reason}</p>
        </section>

        <TargetSnapshotCard report={report} />

        {report.resolved_at && (
          <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
            <h2 className="text-sm font-bold text-fg-2">Решение</h2>
            <p className="mt-1 text-[15px] whitespace-pre-line text-fg">
              {report.resolution_note || "Без комментария"}
            </p>
            <p className="mt-2 text-xs text-muted">
              Закрыл #{report.resolved_by} · {formatDateTime(report.resolved_at)}
            </p>
          </section>
        )}

        <ResolvePanel report={report} />
      </div>
    </div>
  );
}

function TargetSnapshotCard({ report }: { report: ReportDetail }) {
  const rows = snapshotRows(report.target_type, report.target_snapshot);
  const link = snapshotTargetLink(report.target_type, report.target_snapshot);

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <h2 className="mb-3 text-sm font-bold text-fg-2">Объект жалобы</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Цель удалена или недоступна.</p>
      ) : (
        <dl className="space-y-1.5 text-sm">
          {rows.map((r) => (
            <div key={r.label} className="flex gap-2">
              <dt className="w-28 flex-none text-muted">{r.label}</dt>
              <dd className="min-w-0 font-medium break-words text-fg-2">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {link && (
        <Link
          href={link.href}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <IconExternalLink size={15} /> {link.label}
        </Link>
      )}
    </section>
  );
}

const RESOLVE_LABELS: Record<ReportResolveStatus, string> = {
  in_review: "Взять в работу",
  resolved: "Пометить решённой",
  rejected: "Отклонить",
};

function ResolvePanel({ report }: { report: ReportDetail }) {
  const resolve = useResolveReport(report.id);
  const [note, setNote] = useState(report.resolution_note ?? "");

  const act = (status: ReportResolveStatus) => {
    resolve.mutate(
      { status, resolution_note: note.trim() || null },
      {
        onSuccess: () =>
          toast.success(`Статус изменён: ${REPORT_STATUS_LABELS[status]}`),
      },
    );
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <h2 className="mb-3 text-sm font-bold text-fg-2">Обработать</h2>
      <Field label="Комментарий" hint="Необязательно — увидит автор жалобы">
        <Textarea
          rows={3}
          maxLength={2000}
          placeholder="Что решили по жалобе"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>
      <div className="mt-4 flex flex-wrap gap-2">
        {REPORT_RESOLVE_STATUSES.map((s) => (
          <Button
            key={s}
            variant={s === "resolved" ? "primary" : s === "rejected" ? "danger" : "secondary"}
            size="sm"
            loading={resolve.isPending && resolve.variables?.status === s}
            disabled={resolve.isPending || report.status === s}
            onClick={() => act(s)}
          >
            {RESOLVE_LABELS[s]}
          </Button>
        ))}
      </div>
    </section>
  );
}
