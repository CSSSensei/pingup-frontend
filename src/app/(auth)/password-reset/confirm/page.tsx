"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconAlertCircle } from "@/components/ui/icons";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordRequirements } from "@/components/ui/password-requirements";
import { toast } from "@/components/ui/toast";
import { authApi } from "@/lib/api/endpoints/auth";
import { apiErrorMessage } from "@/lib/errors/messages";
import { passwordResetConfirmSchema, type PasswordResetConfirmValues } from "@/lib/schemas/auth";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-[22px] text-center">
        <Link href="/" aria-label="На главную" className="inline-block">
          <Logo className="mx-auto h-[30px]" />
        </Link>
      </div>
      <div className="rounded-lg border border-border bg-surface p-7 shadow-pop">{children}</div>
    </div>
  );
}

function ConfirmForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const passwordId = useId();
  const passwordReqId = useId();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields, submitCount, isSubmitting },
  } = useForm<PasswordResetConfirmValues>({
    resolver: zodResolver(passwordResetConfirmSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });
  const password = watch("password") ?? "";

  if (!token) {
    return (
      <Card>
        <h1 className="text-center text-[23px] font-extrabold tracking-[-0.01em]">
          Ссылка недействительна
        </h1>
        <p className="mt-2 mb-6 text-center text-sm text-muted">
          Ссылка для сброса пароля устарела или неполна. Запросите новую.
        </p>
        <Link
          href="/password-reset"
          className="flex h-12 w-full items-center justify-center rounded bg-primary text-[15px] font-bold text-white hover:bg-primary-600"
        >
          Запросить ссылку заново
        </Link>
      </Card>
    );
  }

  const onSubmit: SubmitHandler<PasswordResetConfirmValues> = async ({ password }) => {
    setFormError(null);
    try {
      await authApi.confirmPasswordReset(token, password);
      toast.success("Пароль обновлён — войдите с новым паролем");
      router.push("/login");
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  };

  return (
    <Card>
      <h1 className="text-center text-[23px] font-extrabold tracking-[-0.01em]">Новый пароль</h1>
      <p className="mt-1 mb-[22px] text-center text-sm text-muted">
        Придумайте новый пароль для входа
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
        <div className="flex flex-col gap-1.5">
          <label htmlFor={passwordId} className="text-[13px] font-bold text-fg-2">
            Новый пароль
          </label>
          <PasswordInput
            id={passwordId}
            aria-describedby={passwordReqId}
            autoComplete="new-password"
            placeholder="Придумайте пароль"
            invalid={!!errors.password}
            {...register("password")}
          />
          <PasswordRequirements
            id={passwordReqId}
            value={password}
            showErrors={!!touchedFields.password || submitCount > 0}
          />
        </div>
        <Field label="Повторите пароль" error={errors.confirmPassword?.message}>
          <PasswordInput
            autoComplete="new-password"
            placeholder="Ещё раз"
            invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-1">
          Сохранить пароль
        </Button>
      </form>
    </Card>
  );
}

export default function PasswordResetConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmForm />
    </Suspense>
  );
}
