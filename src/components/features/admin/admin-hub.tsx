"use client";

import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { IconChevronRight, IconInbox } from "@/components/ui/icons";
import { useReportQueue } from "@/hooks/useReports";

export function AdminHub() {
  // Счётчик открытых жалоб — лёгкий сигнал очереди прямо на хабе.
  const open = useReportQueue({ status: "open", limit: 1, offset: 0 });
  const openCount = open.data?.total;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <PageHeader title="Модерация" description="Инструменты модератора" />

      <div className="space-y-3">
        <Link
          href="/admin/reports"
          className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
        >
          <span className="flex size-11 flex-none items-center justify-center rounded-lg bg-primary-tint text-primary">
            <IconInbox size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-fg">Жалобы</p>
            <p className="text-xs text-muted">Очередь жалоб на игроков, залы, события и объявления</p>
          </div>
          {openCount ? (
            <span className="flex-none rounded-pill bg-status-open/12 px-2.5 py-1 text-xs font-bold text-status-open">
              {openCount}
            </span>
          ) : null}
          <IconChevronRight size={18} className="flex-none text-muted" />
        </Link>
      </div>

      <p className="mt-6 text-xs text-muted">
        Управление пользователями и контентом появится в следующем обновлении.
      </p>
    </div>
  );
}
