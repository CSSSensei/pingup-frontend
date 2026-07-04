"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconCheck, IconLogOut, IconShieldCheck, IconTrash } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PasswordInput } from "@/components/ui/password-input";
import { BallSpinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import {
  useChangeEmail,
  useChangePassword,
  useDeleteAccount,
  useLogoutAll,
  useResendVerification,
  useRevokeSession,
  useSessions,
  useSetMarketingConsent,
} from "@/hooks/useAccount";
import { useMe } from "@/hooks/useMe";
import { apiErrorMessage, fieldErrors } from "@/lib/errors/messages";
import { formatDateTime } from "@/lib/format";
import {
  changeEmailSchema,
  changePasswordSchema,
  type ChangeEmailValues,
  type ChangePasswordValues,
} from "@/lib/schemas/account";
import { useAuthStore } from "@/stores/auth";
import type { MeResponse, SessionRead } from "@/types/api";

export function AccountSettings() {
  const me = useMe();
  const router = useRouter();
  const qc = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clear);

  // Пароль/удаление/logout-all убивают сессию на бэке — чистим клиент и уводим.
  const endSession = (to: string) => {
    clearAuth();
    qc.clear();
    router.replace(to);
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <PageHeader title="Настройки" description="Аккаунт, безопасность и рассылка" />

      {me.isPending ? (
        <div className="flex justify-center py-16">
          <BallSpinner size={30} />
        </div>
      ) : me.isError ? (
        <ErrorState onRetry={() => me.refetch()} />
      ) : (
        <div className="space-y-4">
          <AccountSection me={me.data} onSessionEnd={endSession} />
          <MarketingSection me={me.data} />
          <SessionsSection onSessionEnd={endSession} />
          <DangerZone onDeleted={() => endSession("/")} />
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <div>
        <h2 className="text-sm font-bold text-fg-2">{title}</h2>
        {description && <p className="mt-1 text-xs text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({
  label,
  children,
  action,
}: {
  label: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[13px] font-bold text-fg-2">{label}</div>
        <div className="mt-1 min-w-0">{children}</div>
      </div>
      {action}
    </div>
  );
}

function AccountSection({
  me,
  onSessionEnd,
}: {
  me: MeResponse;
  onSessionEnd: (to: string) => void;
}) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const resend = useResendVerification();

  const onResend = async () => {
    try {
      await resend.mutateAsync();
      toast.success("Письмо отправлено — проверьте почту");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <Section title="Аккаунт">
      <Row
        label="Email"
        action={
          <Button variant="secondary" size="sm" onClick={() => setEmailOpen(true)}>
            Изменить
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm text-fg">{me.email}</span>
          {me.is_email_verified ? (
            <span className="inline-flex items-center gap-1 rounded-pill bg-status-confirmed/12 px-[9px] py-[3px] text-xs font-bold text-status-confirmed">
              <IconCheck size={12} />
              Подтверждён
            </span>
          ) : (
            <Badge>Не подтверждён</Badge>
          )}
        </div>
        {!me.is_email_verified && (
          <button
            type="button"
            onClick={onResend}
            disabled={resend.isPending}
            className="mt-1.5 text-xs font-bold text-primary hover:underline disabled:opacity-50"
          >
            Отправить письмо повторно
          </button>
        )}
      </Row>

      <div className="h-px bg-border" />

      <Row
        label="Пароль"
        action={
          <Button variant="secondary" size="sm" onClick={() => setPasswordOpen(true)}>
            Изменить
          </Button>
        }
      >
        <span className="text-sm text-muted">••••••••</span>
      </Row>

      <ChangeEmailModal open={emailOpen} onClose={() => setEmailOpen(false)} />
      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSuccess={() => onSessionEnd("/login")}
      />
    </Section>
  );
}

function ChangeEmailModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const changeEmail = useChangeEmail();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { new_email: "", password: "" },
  });

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit: SubmitHandler<ChangeEmailValues> = async (v) => {
    try {
      await changeEmail.mutateAsync({ new_email: v.new_email.trim(), password: v.password });
    } catch (err) {
      const fe = fieldErrors(err);
      if (Object.keys(fe).length) {
        for (const [field, message] of Object.entries(fe)) {
          if (field === "new_email" || field === "password") {
            setError(field, { message });
          }
        }
      } else {
        toast.error(apiErrorMessage(err));
      }
      return;
    }
    toast.success("Письмо отправлено на новый адрес — перейдите по ссылке, чтобы подтвердить");
    close();
  };

  return (
    <Modal open={open} onClose={close} title="Изменить email">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Новый email" error={errors.new_email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={!!errors.new_email}
            {...register("new_email")}
          />
        </Field>
        <Field label="Текущий пароль" error={errors.password?.message} hint="Нужен для подтверждения">
          <PasswordInput
            autoComplete="current-password"
            invalid={!!errors.password}
            {...register("password")}
          />
        </Field>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" fullWidth onClick={close}>
            Отмена
          </Button>
          <Button type="submit" fullWidth loading={isSubmitting}>
            Отправить письмо
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ChangePasswordModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const changePassword = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", new_password: "", confirmPassword: "" },
  });

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit: SubmitHandler<ChangePasswordValues> = async (v) => {
    try {
      await changePassword.mutateAsync({
        current_password: v.current_password,
        new_password: v.new_password,
      });
    } catch (err) {
      toast.error(apiErrorMessage(err));
      return;
    }
    toast.success("Пароль изменён — войдите заново");
    onSuccess();
  };

  return (
    <Modal open={open} onClose={close} title="Изменить пароль">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Текущий пароль" error={errors.current_password?.message}>
          <PasswordInput
            autoComplete="current-password"
            invalid={!!errors.current_password}
            {...register("current_password")}
          />
        </Field>
        <Field label="Новый пароль" error={errors.new_password?.message}>
          <PasswordInput
            autoComplete="new-password"
            invalid={!!errors.new_password}
            {...register("new_password")}
          />
        </Field>
        <Field label="Повторите новый пароль" error={errors.confirmPassword?.message}>
          <PasswordInput
            autoComplete="new-password"
            invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </Field>
        <p className="text-xs text-muted">
          После смены пароля мы завершим сеансы на всех устройствах — нужно будет войти заново.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" fullWidth onClick={close}>
            Отмена
          </Button>
          <Button type="submit" fullWidth loading={isSubmitting}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function MarketingSection({ me }: { me: MeResponse }) {
  const setConsent = useSetMarketingConsent();

  const onToggle = async (next: boolean) => {
    try {
      await setConsent.mutateAsync(next);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <Section title="Рассылка">
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span>
          <span className="block text-sm font-bold text-fg">Новости и анонсы на email</span>
          <span className="mt-0.5 block text-xs text-muted">
            Турниры, обновления и полезное о настольном теннисе. Служебные письма приходят всегда.
          </span>
        </span>
        <Switch
          checked={me.marketing_consent}
          onCheckedChange={onToggle}
          disabled={setConsent.isPending}
          label="Согласие на рассылку"
        />
      </label>
    </Section>
  );
}

function SessionsSection({ onSessionEnd }: { onSessionEnd: (to: string) => void }) {
  const sessions = useSessions();
  const revoke = useRevokeSession();
  const logoutAll = useLogoutAll();

  const onLogoutAll = async () => {
    try {
      await logoutAll.mutateAsync();
    } catch (err) {
      toast.error(apiErrorMessage(err));
      return;
    }
    toast.success("Вышли на всех устройствах");
    onSessionEnd("/login");
  };

  const onRevoke = async (familyId: string) => {
    try {
      await revoke.mutateAsync(familyId);
      toast.success("Сеанс завершён");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const items = sessions.data ?? [];
  const hasOthers = items.some((s) => !s.is_current);

  return (
    <Section
      title="Активные сеансы"
      description="Устройства и браузеры, где выполнен вход в аккаунт."
    >
      {sessions.isPending ? (
        <div className="flex justify-center py-6">
          <BallSpinner size={22} />
        </div>
      ) : sessions.isError ? (
        <ErrorState onRetry={() => sessions.refetch()} />
      ) : (
        <ul className="space-y-2.5">
          {items.map((s) => (
            <SessionItem
              key={s.family_id}
              session={s}
              onRevoke={() => onRevoke(s.family_id)}
              revoking={revoke.isPending && revoke.variables === s.family_id}
            />
          ))}
        </ul>
      )}

      {hasOthers && (
        <Button variant="secondary" size="sm" onClick={onLogoutAll} loading={logoutAll.isPending}>
          <IconLogOut size={16} />
          Выйти на всех устройствах
        </Button>
      )}
    </Section>
  );
}

function SessionItem({
  session,
  onRevoke,
  revoking,
}: {
  session: SessionRead;
  onRevoke: () => void;
  revoking: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded bg-surface-2 px-3.5 py-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <IconShieldCheck size={18} className="mt-0.5 flex-none text-muted" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-fg">{describeUA(session.user_agent)}</span>
            {session.is_current && (
              <span className="inline-flex flex-none items-center rounded-pill bg-status-confirmed/12 px-[7px] py-[2px] text-[11px] font-bold text-status-confirmed">
                Этот сеанс
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-xs text-muted">
            {session.ip ?? "IP неизвестен"} · вход {formatDateTime(session.issued_at)}
          </div>
        </div>
      </div>
      {!session.is_current && (
        <Button variant="ghost" size="sm" onClick={onRevoke} loading={revoking}>
          Завершить
        </Button>
      )}
    </li>
  );
}

function DangerZone({ onDeleted }: { onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const del = useDeleteAccount();

  const close = () => {
    setPassword("");
    setOpen(false);
  };

  const onConfirm = async () => {
    try {
      await del.mutateAsync(password);
    } catch (err) {
      toast.error(apiErrorMessage(err));
      return;
    }
    toast.success("Аккаунт удалён");
    onDeleted();
  };

  return (
    <Section title="Удаление аккаунта">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-sm text-xs text-muted">
          Аккаунт и профиль перестанут быть доступны. Это действие необратимо.
        </p>
        <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
          <IconTrash size={16} />
          Удалить аккаунт
        </Button>
      </div>

      <Modal open={open} onClose={close} title="Удалить аккаунт?">
        <p className="text-sm text-fg-2">
          Введите пароль, чтобы подтвердить удаление. Восстановить аккаунт после этого нельзя.
        </p>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (password) onConfirm();
          }}
          className="mt-4 space-y-4"
        >
          <Field label="Пароль">
            <PasswordInput
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" fullWidth onClick={close} disabled={del.isPending}>
              Отмена
            </Button>
            <Button
              type="submit"
              variant="danger"
              fullWidth
              loading={del.isPending}
              disabled={!password}
            >
              Удалить навсегда
            </Button>
          </div>
        </form>
      </Modal>
    </Section>
  );
}

// UA → короткая метка «Браузер · ОС»; для списка сеансов, где важно узнать своё устройство.
function describeUA(ua: string | null): string {
  if (!ua) return "Неизвестное устройство";
  const browser =
    /Edg/.test(ua) ? "Edge"
    : /OPR|Opera/.test(ua) ? "Opera"
    : /Chrome/.test(ua) ? "Chrome"
    : /Firefox/.test(ua) ? "Firefox"
    : /Safari/.test(ua) ? "Safari"
    : "Браузер";
  const os =
    /iPhone|iPad|iOS/.test(ua) ? "iOS"
    : /Android/.test(ua) ? "Android"
    : /Windows/.test(ua) ? "Windows"
    : /Mac OS X|Macintosh/.test(ua) ? "macOS"
    : /Linux/.test(ua) ? "Linux"
    : null;
  return os ? `${browser} · ${os}` : browser;
}
