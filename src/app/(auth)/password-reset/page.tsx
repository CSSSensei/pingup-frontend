"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconAlertCircle, IconCheck } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api/endpoints/auth";
import { apiErrorMessage } from "@/lib/errors/messages";
import { passwordResetRequestSchema, type PasswordResetRequestValues } from "@/lib/schemas/auth";

export default function PasswordResetRequestPage() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetRequestValues>({
    resolver: zodResolver(passwordResetRequestSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { email: "" },
  });

  const onSubmit: SubmitHandler<PasswordResetRequestValues> = async ({ email }) => {
    setFormError(null);
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-[22px] text-center">
        <Link href="/" aria-label="На главную" className="inline-block">
          <Logo className="mx-auto h-[30px]" />
        </Link>
      </div>
      <div className="rounded-lg border border-border bg-surface p-7 shadow-pop">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-status-confirmed/12 text-status-confirmed">
              <IconCheck size={24} />
            </div>
            <h1 className="text-[23px] font-extrabold tracking-[-0.01em]">Проверьте почту</h1>
            <p className="mt-2 text-sm text-muted">
              Если аккаунт с этим email существует, мы отправили ссылку для сброса пароля. Ссылка
              действует ограниченное время.
            </p>
            <Link
              href="/login"
              className="mt-6 flex h-12 w-full items-center justify-center rounded border border-border bg-surface text-[15px] font-bold text-fg hover:bg-surface-2"
            >
              Вернуться ко входу
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-center text-[23px] font-extrabold tracking-[-0.01em]">
              Восстановление пароля
            </h1>
            <p className="mt-1 mb-[22px] text-center text-sm text-muted">
              Введите email — пришлём ссылку для сброса пароля
            </p>
            {formError && (
              <div
                role="alert"
                className="mb-3.5 flex items-start gap-2 rounded border border-danger/25 bg-danger/8 px-3 py-2.5 text-[13px] font-semibold text-danger motion-safe:animate-[pu-fade_0.15s_ease-out]"
              >
                <IconAlertCircle size={15} className="mt-px flex-none" />
                {formError}
              </div>
            )}
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
              <Field label="Email" error={errors.email?.message}>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  invalid={!!errors.email}
                  {...register("email")}
                />
              </Field>
              <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-1">
                Отправить ссылку
              </Button>
            </form>
          </>
        )}
      </div>
      <p className="mt-[18px] text-center text-sm text-muted">
        Вспомнили пароль?{" "}
        <Link href="/login" className="font-bold text-primary">
          Войти
        </Link>
      </p>
    </div>
  );
}
