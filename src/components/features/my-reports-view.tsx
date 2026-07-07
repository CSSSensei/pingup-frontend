"use client";

import Link from "next/link";
import { useState } from "react";

import { MyReportCard } from "@/components/features/my-report-card";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { IconArrowLeft, IconFlag } from "@/components/ui/icons";
import { useMyReports } from "@/hooks/useReports";
import { REPORT_STATUSES, REPORT_STATUS_LABELS, type ReportStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";

type Filter = ReportStatus | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Все" },
  ...REPORT_STATUSES.map((s) => ({ key: s, label: REPORT_STATUS_LABELS[s] })),
];

export function MyReportsView() {
  const [filter, setFilter] = useState<Filter>("all");
  const query = useMyReports({ status: filter === "all" ? undefined : filter });
  const items = query.data?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href="/me"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} /> Мои
      </Link>

      <PageHeader title="Мои жалобы" description="Статус ваших обращений к модераторам" />

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-bold whitespace-nowrap transition-colors",
              filter === f.key ? "bg-primary-tint text-primary" : "text-fg-2 hover:bg-surface-2",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<IconFlag size={32} />}
          title="Жалоб нет"
          description="Вы ещё не отправляли жалоб. Их можно оставить на странице игрока, зала, события или объявления."
        />
      ) : (
        <div className="space-y-3">
          {items.map((report) => (
            <MyReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
