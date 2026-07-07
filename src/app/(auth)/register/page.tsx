"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { IconCheck } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordRequirements } from "@/components/ui/password-requirements";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/api/endpoints/auth";
import { setAccessToken } from "@/lib/auth/tokens";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import { apiErrorMessage, fieldErrors } from "@/lib/errors/messages";
import { registerSchema, type RegisterValues } from "@/lib/schemas/auth";

export default function RegisterPage() {
  const router = useRouter();
  const passwordId = useId();
  const passwordReqId = useId();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    setFocus,
    formState: { errors, touchedFields, isSubmitting, submitCount },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      display_name: "",
      email: "",
      password: "",
      terms_accept: false,
      privacy_consent: false,
      marketing: false,
    },
  });

  const email = watch("email");
  const password = watch("password");
  const emailLooksValid = !!touchedFields.email && !errors.email && !!email;

  const onSubmit: SubmitHandler<RegisterValues> = async (values) => {
    try {
      const session = await authApi.register({
        display_name: values.display_name,
        email: values.email,
        password: values.password,
        city_id: SMOLENSK_CITY_ID,
        marketing_consent: values.marketing ?? false,
      });
      if (session?.access_token) setAccessToken(session.access_token);
      toast.success("Аккаунт создан — подтвердите email на почте");
      router.push("/onboarding");
    } catch (err) {
      const fe = fieldErrors(err);
      if (err instanceof ApiError && err.code === "EMAIL_TAKEN") {
        setError("email", { type: "server", message: "Этот email уже занят" });
        setFocus("email");
      } else if (Object.keys(fe).length) {
        for (const [field, message] of Object.entries(fe)) {
          setError(field as keyof RegisterValues, { message });
        }
        setFocus(Object.keys(fe)[0] as keyof RegisterValues);
      } else {
        toast.error(apiErrorMessage(err));
      }
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-[22px] text-center">
        <Link href="/" aria-label="На главную" className="inline-block">
          <Logo className="mx-auto h-9" />
        </Link>
      </div>
      <div className="rounded-lg border border-border bg-surface p-7 shadow-pop">
        <h1 className="text-center text-[23px] font-extrabold tracking-[-0.01em]">Создать аккаунт</h1>
        <p className="mt-1 mb-[22px] text-center text-sm text-muted">
          Настольный теннис Смоленска ждёт
        </p>
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <Field label="Имя" error={errors.display_name?.message}>
            <Input
              type="text"
              autoComplete="name"
              placeholder="Как вас зовут"
              invalid={!!errors.display_name}
              {...register("display_name")}
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <Field
              label="Email"
              error={errors.email?.message}
              hint={
                emailLooksValid ? (
                  <span className="inline-flex items-center gap-1 text-status-confirmed">
                    <IconCheck size={13} /> Похоже на верный email
                  </span>
                ) : undefined
              }
            >
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                invalid={!!errors.email}
                {...register("email")}
              />
            </Field>
            {errors.email?.type === "server" && (
              <Link
                href="/login"
                className="self-start text-xs font-bold text-primary underline underline-offset-2"
              >
                Войти в этот аккаунт →
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={passwordId} className="text-[13px] font-bold text-fg-2">
              Пароль
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

          <Checkbox error={errors.terms_accept?.message} {...register("terms_accept")}>
            Принимаю{" "}
            <Link href="/legal/terms" className="font-semibold text-primary underline underline-offset-2">
              пользовательское соглашение
            </Link>
            .
          </Checkbox>

          <Checkbox error={errors.privacy_consent?.message} {...register("privacy_consent")}>
            Даю согласие на обработку персональных данных в соответствии с{" "}
            <Link href="/legal/privacy" className="font-semibold text-primary underline underline-offset-2">
              политикой обработки персональных данных
            </Link>
            .
          </Checkbox>

          <Checkbox {...register("marketing")}>Я даю согласие на получение рассылок.</Checkbox>

          <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-1">
            Создать аккаунт
          </Button>
        </form>
      </div>
      <p className="mt-[18px] text-center text-sm text-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-bold text-primary">
          Войти
        </Link>
      </p>
    </div>
  );
}
