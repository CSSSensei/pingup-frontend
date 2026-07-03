"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/common/page-header";
import {
  IconActivity,
  IconBuilding,
  IconCalendar,
  IconChevronRight,
  IconInbox,
  IconStar,
  IconTrophy,
  IconUsers,
} from "@/components/ui/icons";
import { useMe } from "@/hooks/useMe";
import { useReportQueue } from "@/hooks/useReports";
import { isAdmin } from "@/lib/roles";

export function AdminHub() {
  const { data: me } = useMe();
  const admin = isAdmin(me?.role);
  const open = useReportQueue({ status: "open", limit: 1, offset: 0 });
  const openCount = open.data?.total;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <PageHeader
        title={admin ? "Администрирование" : "Модерация"}
        description={admin ? "Пользователи, контент и рейтинги" : "Инструменты модератора"}
      />

      <div className="space-y-3">
        <SectionCard
          href="/admin/reports"
          icon={<IconInbox size={22} />}
          title="Жалобы"
          description="Очередь жалоб на игроков, залы, события и объявления"
          badge={openCount || undefined}
        />

        {admin && (
          <>
            <SectionCard
              href="/admin/users"
              icon={<IconUsers size={22} />}
              title="Пользователи"
              description="Роли, блокировки, суперпользователь, удаление"
            />
            <SectionCard
              href="/admin/venues"
              icon={<IconBuilding size={22} />}
              title="Залы"
              description="Верификация, редактирование, удаление и восстановление"
            />
            <SectionCard
              href="/admin/events"
              icon={<IconCalendar size={22} />}
              title="События"
              description="Модерация игр и тренировок, статусы, скрытие"
            />
            <SectionCard
              href="/admin/tournaments"
              icon={<IconTrophy size={22} />}
              title="Турниры"
              description="Официальные турниры, статусы, участники"
            />
            <SectionCard
              href="/admin/reviews"
              icon={<IconStar size={22} />}
              title="Отзывы"
              description="Скрытие и удаление отзывов"
            />
            <SectionCard
              href="/admin/rating-sync"
              icon={<IconActivity size={22} />}
              title="Синхронизация рейтинга"
              description="Лог синка, устаревшие профили, ручной запуск"
            />
          </>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
    >
      <span className="flex size-11 flex-none items-center justify-center rounded-lg bg-primary-tint text-primary">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-fg">{title}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      {badge ? (
        <span className="flex-none rounded-pill bg-status-open/12 px-2.5 py-1 text-xs font-bold text-status-open">
          {badge}
        </span>
      ) : null}
      <IconChevronRight size={18} className="flex-none text-muted" />
    </Link>
  );
}
