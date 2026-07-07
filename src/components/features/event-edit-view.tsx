"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { EventForm } from "@/components/features/event-form";
import { EmptyState, ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { ApiError } from "@/lib/api/client";
import { IconArrowLeft } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useEvent } from "@/hooks/useEvents";
import { useMe } from "@/hooks/useMe";
import { eventHref, eventSection, type EventSection } from "@/lib/links";
import { isModerator } from "@/lib/roles";

export function EventEditView({ id, section }: { id: number; section: EventSection }) {
  const router = useRouter();
  const query = useEvent(id);
  const { data: me } = useMe();

  // Игры и тренировки — одни события; чужой раздел в URL тихо поправляем.
  const event = query.data;
  const wrongSection = event != null && eventSection(event.event_type) !== section;
  useEffect(() => {
    if (event && wrongSection) router.replace(`${eventHref(event)}/edit`);
  }, [event, wrongSection, router]);

  const backHref = `/${section}/${id}/manage`;
  const noAccess =
    event != null && me != null && event.organizer_id !== me.id && !isModerator(me.role);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        К управлению
      </Link>

      {query.isPending || wrongSection || (event && !me) ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : query.isError ? (
        query.error instanceof ApiError && query.error.status === 404 ? (
          <EmptyState title="Событие не найдено" description="Возможно, его удалили или отменили." />
        ) : (
          <ErrorState onRetry={() => query.refetch()} />
        )
      ) : noAccess ? (
        <EmptyState
          title="Нет доступа"
          description="Редактировать событие может организатор или модератор."
        />
      ) : event ? (
        <>
          <PageHeader
            title="Редактирование"
            description={event.title}
          />
          <EventForm
            kind={event.event_type === "game" ? "game" : "training"}
            initial={event}
            onSaved={(saved) => {
              toast.success("Изменения сохранены");
              router.push(eventHref(saved));
            }}
          />
        </>
      ) : null}
    </div>
  );
}
