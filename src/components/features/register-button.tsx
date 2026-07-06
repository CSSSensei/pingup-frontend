"use client";

import Link from "next/link";

import { ContactGateButton } from "@/components/features/contact-gate";
import { Button } from "@/components/ui/button";
import { IconCheck } from "@/components/ui/icons";
import {
  useRegisterTournament,
  useUnregisterTournament,
} from "@/hooks/useTournaments";
import { useHasContact } from "@/hooks/useHasContact";
import { useAuthStatus, useMe } from "@/hooks/useMe";
import { toast } from "@/components/ui/toast";
import type { TournamentStatus } from "@/lib/enums";
import { deadlinePassed, isFull } from "@/lib/tournaments";
import type { TournamentRead } from "@/types/api";

const CLOSED_REASON: Partial<Record<TournamentStatus, string>> = {
  announced: "Регистрация ещё не открыта",
  registration_closed: "Регистрация закрыта",
  in_progress: "Турнир уже идёт",
  completed: "Турнир завершён",
  cancelled: "Турнир отменён",
};

// Клиентский island: персональные состояния (is_registered/организатор) не рендерятся в SSR.
export function RegisterButton({ tournament }: { tournament: TournamentRead }) {
  const status = useAuthStatus();
  const { data: me } = useMe();
  const hasContact = useHasContact();
  const register = useRegisterTournament(tournament.id, tournament.slug);
  const unregister = useUnregisterTournament(tournament.id, tournament.slug);

  if (status === "idle" || status === "authenticating") {
    return (
      <Button size="lg" fullWidth loading disabled className="sm:w-auto sm:px-10">
        Загрузка
      </Button>
    );
  }

  if (status !== "authed") {
    const next = encodeURIComponent(`/tournaments/${tournament.slug}`);
    return (
      <Link href={`/login?next=${next}`} className="w-full sm:w-auto">
        <Button size="lg" fullWidth className="sm:w-auto sm:px-10">
          Войти, чтобы участвовать
        </Button>
      </Link>
    );
  }

  if (tournament.organizer_id != null && me?.id === tournament.organizer_id) {
    return (
      <Link href={`/tournaments/${tournament.slug}/manage`} className="w-full sm:w-auto">
        <Button size="lg" fullWidth variant="secondary" className="sm:w-auto sm:px-10">
          Управлять турниром
        </Button>
      </Link>
    );
  }

  if (tournament.is_registered) {
    return (
      <div className="flex w-full flex-col gap-2 sm:w-auto">
        <span className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-status-confirmed/12 px-5 py-3 text-[15px] font-bold text-status-confirmed">
          <IconCheck size={18} /> Вы зарегистрированы
        </span>
        <Button
          size="sm"
          variant="ghost"
          loading={unregister.isPending}
          onClick={() =>
            unregister.mutate(undefined, {
              onSuccess: () => toast.success("Регистрация отменена"),
            })
          }
          className="text-danger"
        >
          Отменить регистрацию
        </Button>
      </div>
    );
  }

  if (tournament.status !== "registration_open") {
    return (
      <Button size="lg" fullWidth disabled className="sm:w-auto sm:px-10">
        {CLOSED_REASON[tournament.status] ?? "Регистрация недоступна"}
      </Button>
    );
  }

  if (deadlinePassed(tournament)) {
    return (
      <Button size="lg" fullWidth disabled className="sm:w-auto sm:px-10">
        Срок регистрации истёк
      </Button>
    );
  }

  if (isFull(tournament)) {
    return (
      <Button size="lg" fullWidth disabled className="sm:w-auto sm:px-10">
        Мест нет
      </Button>
    );
  }

  if (hasContact === false) {
    return <ContactGateButton />;
  }

  return (
    <Button
      size="lg"
      fullWidth
      loading={register.isPending}
      onClick={() =>
        register.mutate(undefined, {
          onSuccess: () => toast.success("Вы зарегистрированы на турнир"),
        })
      }
      className="sm:w-auto sm:px-10"
    >
      Зарегистрироваться
    </Button>
  );
}
