"use client";

import { useState } from "react";

import { ReportCard } from "@/components/features/admin/report-card";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { Pager } from "@/components/features/admin/admin-venues-view";
import { Select } from "@/components/ui/select";
import { IconInbox } from "@/components/ui/icons";
import { useReportQueue } from "@/hooks/useReports";
import {
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  REPORT_TARGET_LABELS,
  REPORT_TARGET_TYPES,
  type ReportStatus,
  type ReportTargetType,
} from "@/lib/enums";
import { cn } from "@/lib/utils";

const LIMIT = 30;

export function ReportsQueueView() {
  const [status, setStatus] = useState<ReportStatus>("open");
  const [targetType, setTargetType] = useState<ReportTargetType | "">("");
  const [offset, setOffset] = useState(0);

  const query = useReportQueue({
    status,
    target_type: targetType || undefined,
    limit: LIMIT,
    offset,
  });
  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  const pickStatus = (s: ReportStatus) => {
    setStatus(s);
    setOffset(0);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <PageHeader title="Жалобы" description="Очередь модерации" />

      <div className="mb-3 flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
        {REPORT_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => pickStatus(s)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-bold whitespace-nowrap transition-colors",
              status === s ? "bg-primary-tint text-primary" : "text-fg-2 hover:bg-surface-2",
            )}
          >
            {REPORT_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="mb-5 max-w-xs">
        <Select
          value={targetType}
          aria-label="Тип цели"
          onChange={(e) => {
            setTargetType(e.target.value as ReportTargetType | "");
            setOffset(0);
          }}
        >
          <option value="">Все типы целей</option>
          {REPORT_TARGET_TYPES.map((t) => (
            <option key={t} value={t}>
              {REPORT_TARGET_LABELS[t]}
            </option>
          ))}
        </Select>
      </div>

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<IconInbox size={32} />}
          title="Жалоб нет"
          description={
            status === "open" ? "Новых жалоб не поступало." : "Здесь пусто по выбранному фильтру."
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {items.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>

          <Pager offset={offset} total={total} onChange={setOffset} limit={LIMIT} />
        </>
      )}
    </div>
  );
}
