"use client";

import { useState } from "react";

import { EventCard } from "@/components/features/event-card";
import { CardListSkeleton, EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { IconCalendar } from "@/components/ui/icons";
import { useMyEvents } from "@/hooks/useMyEvents";
import { cn } from "@/lib/utils";
import type { MyEventsRole } from "@/types/api";

const TABS: { key: MyEventsRole; label: string }[] = [
  { key: "participant", label: "Я участвую" },
  { key: "organizer", label: "Организую" },
];

export default function MyEventsPage() {
  const [role, setRole] = useState<MyEventsRole>("participant");
  const query = useMyEvents({ role });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <PageHeader title="Мои игры" description="События, где вы участвуете или которые организуете" />

      <div className="mb-5 flex gap-1 rounded-lg border border-border bg-surface p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setRole(tab.key)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-bold transition-colors",
              role === tab.key ? "bg-primary-tint text-primary" : "text-fg-2 hover:bg-surface-2",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {query.isPending ? (
        <CardListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.data.items.length === 0 ? (
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
      ) : (
        <div className="space-y-3">
          {query.data.items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
