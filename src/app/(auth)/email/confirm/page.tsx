"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { Logo } from "@/components/brand/logo";
import { IconAlertCircle, IconCheck } from "@/components/ui/icons";
import { BallSpinner } from "@/components/ui/spinner";
import { usersApi } from "@/lib/api/endpoints/users";
import { apiErrorMessage } from "@/lib/errors/messages";
import { qk } from "@/lib/queryKeys";
import { useAuthStore } from "@/stores/auth";

type State = "verifying" | "success" | "error" | "need-login";

function ConfirmEmailChange() {
  const token = useSearchParams().get("token") ?? "";
  const status = useAuthStore((s) => s.status);
  const qc = useQueryClient();
  const [state, setState] = useState<State>("verifying");
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (!token) {
      setState("error");
      setError("Ссылка неполная или недействительна.");
      return;
    }
    // Эндпоинт подтверждения требует авторизации → ждём bootstrap, anon просим войти.
    if (status === "idle" || status === "authenticating") return;
    if (status === "anon") {
      setState("need-login");
      return;
    }
    if (ran.current) return;
    ran.current = true;
    usersApi
      .confirmEmailChange(token)
      .then(() => {
        qc.invalidateQueries({ queryKey: qk.me });
        setState("success");
      })
      .catch((err) => {
        setError(apiErrorMessage(err));
        setState("error");
      });
  }, [token, status, qc]);

  const loginHref = `/login?next=${encodeURIComponent(`/email/confirm?token=${token}`)}`;

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-[22px] text-center">
        <Link href="/" aria-label="На главную" className="inline-block">
          <Logo className="mx-auto h-[30px]" />
        </Link>
      </div>
      <div className="rounded-lg border border-border bg-surface p-7 text-center shadow-pop">
        {state === "verifying" && (
          <div className="flex flex-col items-center gap-4 py-4" aria-live="polite">
            <BallSpinner size={32} />
            <p className="text-sm font-semibold text-fg-2">Подтверждаем новый email…</p>
          </div>
        )}

        {state === "need-login" && (
          <>
            <h1 className="text-[23px] font-extrabold tracking-[-0.01em]">Нужен вход</h1>
            <p className="mt-2 text-sm text-muted">
              Войдите в тот же аккаунт, чтобы подтвердить смену email.
            </p>
            <Link
              href={loginHref}
              className="mt-6 flex h-12 w-full items-center justify-center rounded bg-primary text-[15px] font-bold text-white hover:bg-primary-600"
            >
              Войти
            </Link>
          </>
        )}

        {state === "success" && (
          <>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-status-confirmed/12 text-status-confirmed">
              <IconCheck size={24} />
            </div>
            <h1 className="text-[23px] font-extrabold tracking-[-0.01em]">Email обновлён</h1>
            <p className="mt-2 text-sm text-muted">
              Новый адрес подтверждён — теперь вход выполняется по нему.
            </p>
            <Link
              href="/settings"
              className="mt-6 flex h-12 w-full items-center justify-center rounded bg-primary text-[15px] font-bold text-white hover:bg-primary-600"
            >
              К настройкам
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
              <IconAlertCircle size={24} />
            </div>
            <h1 className="text-[23px] font-extrabold tracking-[-0.01em]">
              Не удалось подтвердить email
            </h1>
            <p className="mt-2 text-sm text-muted">{error}</p>
            <p className="mt-1 text-sm text-muted">
              Ссылка действует 24 часа — при необходимости запросите смену email заново.
            </p>
            <Link
              href="/settings"
              className="mt-6 flex h-12 w-full items-center justify-center rounded border border-border bg-surface text-[15px] font-bold text-fg hover:bg-surface-2"
            >
              К настройкам
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function ConfirmEmailChangePage() {
  return (
    <Suspense fallback={null}>
      <ConfirmEmailChange />
    </Suspense>
  );
}
