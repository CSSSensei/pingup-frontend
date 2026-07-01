"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconAlertCircle } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { authApi } from "@/lib/api/endpoints/auth";
import { setAccessToken } from "@/lib/auth/tokens";
import { apiErrorMessage, fieldErrors } from "@/lib/errors/messages";
import { loginSchema, type LoginValues } from "@/lib/schemas/auth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit: SubmitHandler<LoginValues> = async (values) => {
    setFormError(null);
    try {
      const session = await authApi.login({ email: values.email, password: values.password });
      setAccessToken(session.access_token);
      router.push(next);
    } catch (err) {
      const fe = fieldErrors(err);
      if (Object.keys(fe).length) {
        for (const [field, message] of Object.entries(fe)) {
          setError(field as keyof LoginValues, { message });
        }
      } else {
        setFormError(apiErrorMessage(err));
      }
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
        <h1 className="text-center text-[23px] font-extrabold tracking-[-0.01em]">С возвращением</h1>
        <p className="mt-1 mb-[22px] text-center text-sm text-muted">
          Войдите, чтобы записываться на игры
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
          <Field label="Пароль" error={errors.password?.message}>
            <PasswordInput
              autoComplete="current-password"
              placeholder="••••••••"
              invalid={!!errors.password}
              {...register("password")}
            />
          </Field>
          <div className="flex items-center justify-between text-[13px]">
            <label className="flex cursor-pointer items-center gap-1.5 font-semibold text-fg-2">
              <input type="checkbox" className="size-4 accent-primary" {...register("remember")} />
              Запомнить меня
            </label>
            <Link href="/password-reset" className="font-bold text-primary">
              Забыли пароль?
            </Link>
          </div>
          <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-1">
            Войти
          </Button>
        </form>

        <div className="my-[18px] flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-border" />
          или
          <div className="h-px flex-1 bg-border" />
        </div>
        <Button variant="secondary" size="lg" fullWidth onClick={() => router.push("/")}>
          Продолжить как гость
        </Button>
      </div>
      <p className="mt-[18px] text-center text-sm text-muted">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-bold text-primary">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
