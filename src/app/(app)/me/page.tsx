"use client";

import { useState } from "react";

import { EventCard } from "@/components/features/event-card";
import { PartnerRequestCard } from "@/components/features/partner-request-card";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { IconCalendar, IconUsers } from "@/components/ui/icons";
import { useMyEvents } from "@/hooks/useMyEvents";
import { useMyPartnerRequests } from "@/hooks/usePartners";
import { cn } from "@/lib/utils";

type Tab = "participant" | "organizer" | "partners";

const TABS: { key: Tab; label: string }[] = [
  { key: "participant", label: "Я участвую" },
  { key: "organizer", label: "Организую" },
  { key: "partners", label: "Мои объявления" },
];

export default function MyPage() {
  const [tab, setTab] = useState<Tab>("participant");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <PageHeader title="Мои" description="События и объявления, где вы участвуете или которые создали" />

      <div className="mb-5 flex gap-1 rounded-lg border border-border bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-bold transition-colors",
              tab === t.key ? "bg-primary-tint text-primary" : "text-fg-2 hover:bg-surface-2",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "partners" ? <MyPartners /> : <MyEvents role={tab} />}
    </div>
  );
}

function MyEvents({ role }: { role: "participant" | "organizer" }) {
  const query = useMyEvents({ role });

  if (query.isPending) return <CardListSkeleton />;
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;
  if (query.data.items.length === 0) {
    return (
      <EmptyState
        icon={<IconCalendar size={32} />}
        title={role === "participant" ? "Вы пока никуда не записаны" : "Вы ещё не создавали игр"}
        description="Найдите ближайшую игру или создайте свою."
        action={
          <LinkButton href="/games" size="sm">
            К списку игр
          </LinkButton>
        }
      />
    );
  }
  return (
    <div className="space-y-3">
      {query.data.items.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function MyPartners() {
  const query = useMyPartnerRequests();

  if (query.isPending) return <CardListSkeleton />;
  if (query.isError) return <ErrorState onRetry={() => query.refetch()} />;
  if (query.data.items.length === 0) {
    return (
      <EmptyState
        icon={<IconUsers size={32} />}
        title="У вас нет объявлений"
        description="Разместите объявление о поиске напарника — отклики придут в уведомления."
        action={
          <LinkButton href="/partners/new" size="sm">
            Создать объявление
          </LinkButton>
        }
      />
    );
  }
  return (
    <div className="space-y-3">
      {query.data.items.map((request) => (
        <PartnerRequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}
