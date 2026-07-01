"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { IconCheck } from "@/components/ui/icons";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useRespondPartner } from "@/hooks/usePartners";
import { useAuthStatus, useMe } from "@/hooks/useMe";
import type { PartnerRequestRead } from "@/types/api";

// Клиентский island: персональные состояния (has_responded/автор) не рендерятся в SSR.
export function RespondButton({ request }: { request: PartnerRequestRead }) {
  const status = useAuthStatus();
  const { data: me } = useMe();
  const respond = useRespondPartner(request.id);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  if (status === "idle" || status === "authenticating") {
    return (
      <Button size="lg" fullWidth loading disabled className="sm:w-auto sm:px-10">
        Загрузка
      </Button>
    );
  }

  if (status !== "authed") {
    const next = encodeURIComponent(`/partners/${request.id}`);
    return (
      <Link href={`/login?next=${next}`} className="w-full sm:w-auto">
        <Button size="lg" fullWidth className="sm:w-auto sm:px-10">
          Войти, чтобы откликнуться
        </Button>
      </Link>
    );
  }

  if (me?.id === request.author_id) {
    return (
      <Link href={`/partners/${request.id}/responses`} className="w-full sm:w-auto">
        <Button size="lg" fullWidth variant="secondary" className="sm:w-auto sm:px-10">
          Смотреть отклики · {request.responses_count}
        </Button>
      </Link>
    );
  }

  if (request.has_responded) {
    return (
      <span className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-status-confirmed/12 px-5 py-3 text-[15px] font-bold text-status-confirmed">
        <IconCheck size={18} /> Вы откликнулись
      </span>
    );
  }

  if (request.status !== "active") {
    const label =
      request.status === "matched"
        ? "Напарник найден"
        : request.status === "expired"
          ? "Объявление истекло"
          : "Объявление закрыто";
    return (
      <Button size="lg" fullWidth disabled className="sm:w-auto sm:px-10">
        {label}
      </Button>
    );
  }

  const submit = () => {
    respond.mutate(
      { message: message.trim() || null },
      {
        onSuccess: () => {
          setOpen(false);
          setMessage("");
          toast.success("Отклик отправлен автору");
        },
      },
    );
  };

  return (
    <>
      <Button size="lg" fullWidth onClick={() => setOpen(true)} className="sm:w-auto sm:px-10">
        Откликнуться
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Откликнуться на объявление">
        <p className="text-sm text-fg-2">
          Автор увидит ваш профиль и сообщение. Можно откликнуться и без текста.
        </p>
        <Textarea
          className="mt-3"
          rows={4}
          maxLength={2000}
          placeholder="Пара слов о себе и когда удобно играть (необязательно)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" fullWidth onClick={() => setOpen(false)} disabled={respond.isPending}>
            Отмена
          </Button>
          <Button fullWidth loading={respond.isPending} onClick={submit}>
            Отправить отклик
          </Button>
        </div>
      </Modal>
    </>
  );
}
