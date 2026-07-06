"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { Logo } from "@/components/brand/logo";
import { IconAlertCircle, IconCheck } from "@/components/ui/icons";
import { BallSpinner } from "@/components/ui/spinner";
import { authApi } from "@/lib/api/endpoints/auth";
import { apiErrorMessage } from "@/lib/errors/messages";

type State = "verifying" | "success" | "error";

function VerifyEmail() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<State>(token ? "verifying" : "error");
  const [error, setError] = useState(token ? "" : "Ссылка неполная или недействительна.");
  const ran = useRef(false);

  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true;
    authApi
      .verifyEmail(token)
      .then(() => setState("success"))
      .catch((err) => {
        setError(apiErrorMessage(err));
        setState("error");
      });
  }, [token]);

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
            <p className="text-sm font-semibold text-fg-2">Подтверждаем email…</p>
          </div>
        )}

        {state === "success" && (
          <>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-status-confirmed/12 text-status-confirmed">
              <IconCheck size={24} />
            </div>
            <h1 className="text-[23px] font-extrabold tracking-[-0.01em]">Email подтверждён</h1>
            <p className="mt-2 text-sm text-muted">
              Спасибо! Теперь доступны все возможности pingup.
            </p>
            <Link
              href="/login"
              className="mt-6 flex h-12 w-full items-center justify-center rounded bg-primary text-[15px] font-bold text-white hover:bg-primary-600"
            >
              Войти
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
              Войдите в аккаунт и запросите новое письмо для подтверждения.
            </p>
            <Link
              href="/login"
              className="mt-6 flex h-12 w-full items-center justify-center rounded border border-border bg-surface text-[15px] font-bold text-fg hover:bg-surface-2"
            >
              Войти
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  );
}
