"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { IconCheck } from "@/components/ui/icons";
import { useJoinEvent, useLeaveEvent } from "@/hooks/useEvents";
import { useAuthStatus, useMe } from "@/hooks/useMe";
import { eventHref } from "@/lib/links";
import type { EventRead } from "@/types/api";

// Клиентский island: персональные состояния (is_joined/организатор) не рендерятся в SSR.
export function JoinButton({ event }: { event: EventRead }) {
  const status = useAuthStatus();
  const { data: me } = useMe();
  const join = useJoinEvent(event.id);
  const leave = useLeaveEvent(event.id);

  if (status === "idle" || status === "authenticating") {
    return (
      <Button size="lg" fullWidth loading disabled className="sm:w-auto sm:px-10">
        Загрузка
      </Button>
    );
  }

  if (status !== "authed") {
    const next = encodeURIComponent(eventHref(event));
    return (
      <Link href={`/login?next=${next}`} className="w-full sm:w-auto">
        <Button size="lg" fullWidth className="sm:w-auto sm:px-10">
          Войти, чтобы участвовать
        </Button>
      </Link>
    );
  }

  const isOrganizer = me?.id === event.organizer_id;
  if (isOrganizer) {
    return (
      <Link href={`/games/${event.id}/manage`} className="w-full sm:w-auto">
        <Button size="lg" fullWidth variant="secondary" className="sm:w-auto sm:px-10">
          Управлять участниками
        </Button>
      </Link>
    );
  }

  if (event.is_joined) {
    return (
      <div className="flex w-full flex-col gap-2 sm:w-auto">
        <span className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-status-confirmed/12 px-5 py-3 text-[15px] font-bold text-status-confirmed">
          <IconCheck size={18} /> Заявка отправлена
        </span>
        <Button
          size="sm"
          variant="ghost"
          loading={leave.isPending}
          onClick={() => leave.mutate()}
          className="text-danger"
        >
          Отменить участие
        </Button>
      </div>
    );
  }

  if (event.status === "cancelled") {
    return (
      <Button size="lg" fullWidth disabled className="sm:w-auto sm:px-10">
        Событие отменено
      </Button>
    );
  }
  if (event.status === "completed") {
    return (
      <Button size="lg" fullWidth disabled className="sm:w-auto sm:px-10">
        Событие завершено
      </Button>
    );
  }
  if (event.status === "full") {
    return (
      <Button size="lg" fullWidth disabled className="sm:w-auto sm:px-10">
        Мест нет
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      fullWidth
      loading={join.isPending}
      onClick={() => join.mutate()}
      className="sm:w-auto sm:px-10"
    >
      Участвовать
    </Button>
  );
}
