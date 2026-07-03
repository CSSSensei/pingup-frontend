"use client";

import Link from "next/link";
import { useState } from "react";

import { ApiError } from "@/lib/api/client";
import { Avatar } from "@/components/common/avatar";
import { EmptyState, ErrorState } from "@/components/common/states";
import { Badge, UserRoleBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Field } from "@/components/ui/field";
import { LinkButton } from "@/components/ui/link-button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { IconArrowLeft, IconExternalLink } from "@/components/ui/icons";
import {
  useAdminUser,
  useBanUser,
  useDeleteUser,
  useSetRole,
  useSetSuperuser,
  useUnbanUser,
} from "@/hooks/useAdmin";
import { useMe } from "@/hooks/useMe";
import { USER_COUNTER_LABELS } from "@/lib/admin";
import { USER_ROLES, USER_ROLE_LABELS } from "@/lib/enums";
import { formatDate, formatDateTime } from "@/lib/format";
import type { AdminUserDetail, UserRole } from "@/types/api";

export function AdminUserDetailView({ id }: { id: number }) {
  const query = useAdminUser(id);

  const backLink = (
    <Link
      href="/admin/users"
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-fg-2 hover:text-fg"
    >
      <IconArrowLeft size={16} /> К пользователям
    </Link>
  );

  if (query.isPending) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
        {backLink}
        <Skeleton className="h-36 w-full" />
        <Skeleton className="mt-3 h-40 w-full" />
      </div>
    );
  }

  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.status === 404;
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
        {backLink}
        {notFound ? (
          <EmptyState
            title="Пользователь не найден"
            action={
              <LinkButton href="/admin/users" variant="secondary" size="sm">
                К списку
              </LinkButton>
            }
          />
        ) : (
          <ErrorState onRetry={() => query.refetch()} />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      {backLink}
      <div className="space-y-4">
        <HeaderCard user={query.data} />
        <CountersCard user={query.data} />
        <ActionsCard user={query.data} />
      </div>
    </div>
  );
}

function HeaderCard({ user }: { user: AdminUserDetail }) {
  const name = user.profile?.display_name ?? user.email;
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <div className="flex items-start gap-4">
        <Avatar src={user.profile?.avatar_url ?? null} name={name} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h1 className="text-lg font-extrabold tracking-[-0.01em] text-fg">{name}</h1>
            <UserRoleBadge role={user.role} />
            {user.is_superuser && <Badge className="bg-primary-tint text-primary">super</Badge>}
          </div>
          <p className="mt-0.5 truncate text-sm text-muted">{user.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {user.deleted_at ? (
              <Badge className="bg-status-cancelled/12 text-status-cancelled">Удалён</Badge>
            ) : !user.is_active ? (
              <Badge className="bg-status-declined/12 text-status-declined">Заблокирован</Badge>
            ) : (
              <Badge className="bg-status-confirmed/12 text-status-confirmed">Активен</Badge>
            )}
            {!user.is_email_verified && (
              <Badge className="bg-status-pending/12 text-status-pending">
                Email не подтверждён
              </Badge>
            )}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-4 text-sm">
        <Row label="ID" value={`#${user.id}`} />
        <Row label="Город" value={`#${user.city_id}`} />
        <Row label="Регистрация" value={formatDate(user.created_at)} />
        <Row
          label="Последний вход"
          value={user.last_login_at ? formatDateTime(user.last_login_at) : "—"}
        />
      </dl>

      {user.profile?.slug && (
        <Link
          href={`/players/${user.profile.slug}`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          <IconExternalLink size={15} /> Публичный профиль
        </Link>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 flex-none text-muted">{label}</dt>
      <dd className="min-w-0 font-medium break-words text-fg-2">{value}</dd>
    </div>
  );
}

function CountersCard({ user }: { user: AdminUserDetail }) {
  const entries = Object.entries(user.counters ?? {});
  if (entries.length === 0) return null;
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <h2 className="mb-3 text-sm font-bold text-fg-2">Активность</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {entries.map(([key, count]) => (
          <div key={key} className="rounded-lg bg-surface-2 p-3 text-center">
            <p className="text-xl font-extrabold text-fg">{count}</p>
            <p className="mt-0.5 text-xs text-muted">{USER_COUNTER_LABELS[key] ?? key}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ActionsCard({ user }: { user: AdminUserDetail }) {
  const { data: me } = useMe();
  const isSelf = me?.id === user.id;
  const iAmSuperuser = me?.is_superuser ?? false;

  if (user.deleted_at) {
    return (
      <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
        <h2 className="mb-1 text-sm font-bold text-fg-2">Действия</h2>
        <p className="text-sm text-muted">
          Аккаунт удалён {formatDateTime(user.deleted_at)}. Действия недоступны.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <h2 className="text-sm font-bold text-fg-2">Действия</h2>

      {isSelf && (
        <p className="rounded-md bg-surface-2 px-3 py-2 text-xs text-muted">
          Это ваш аккаунт — применять к себе бан, смену роли и удаление нельзя.
        </p>
      )}

      <RoleControl key={user.role} user={user} disabled={isSelf} iAmSuperuser={iAmSuperuser} />
      {user.role === "admin" && (
        <SuperuserControl user={user} disabled={isSelf || !iAmSuperuser} iAmSuperuser={iAmSuperuser} />
      )}
      <BanControl user={user} disabled={isSelf} />
      <DeleteControl user={user} disabled={isSelf} />
    </section>
  );
}

function RoleControl({
  user,
  disabled,
  iAmSuperuser,
}: {
  user: AdminUserDetail;
  disabled: boolean;
  iAmSuperuser: boolean;
}) {
  const [role, setRole] = useState<UserRole>(user.role);
  const mutation = useSetRole(user.id);
  const touchesAdmin = user.role === "admin" || role === "admin";
  const blockedBySuperuser = touchesAdmin && !iAmSuperuser;

  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-fg-2">Роль</p>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          className="max-w-[190px]"
          aria-label="Роль пользователя"
          value={role}
          disabled={disabled}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {USER_ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
        <Button
          size="sm"
          loading={mutation.isPending}
          disabled={disabled || role === user.role || blockedBySuperuser}
          onClick={() =>
            mutation.mutate(
              { role },
              { onSuccess: () => toast.success(`Роль изменена: ${USER_ROLE_LABELS[role]}`) },
            )
          }
        >
          Применить
        </Button>
      </div>
      {blockedBySuperuser && (
        <p className="mt-1.5 text-xs text-danger">
          Управление ролью администратора доступно только суперпользователю.
        </p>
      )}
    </div>
  );
}

function SuperuserControl({
  user,
  disabled,
  iAmSuperuser,
}: {
  user: AdminUserDetail;
  disabled: boolean;
  iAmSuperuser: boolean;
}) {
  const mutation = useSetSuperuser(user.id);
  return (
    <div>
      <label className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-fg-2">Суперпользователь</span>
        <Switch
          checked={user.is_superuser}
          disabled={disabled || mutation.isPending}
          onCheckedChange={(v) =>
            mutation.mutate(
              { is_superuser: v },
              {
                onSuccess: () =>
                  toast.success(v ? "Выдан статус superuser" : "Статус superuser снят"),
              },
            )
          }
        />
      </label>
      {!iAmSuperuser && (
        <p className="mt-1.5 text-xs text-muted">Доступно только суперпользователю.</p>
      )}
    </div>
  );
}

function BanControl({ user, disabled }: { user: AdminUserDetail; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const ban = useBanUser(user.id);
  const unban = useUnbanUser(user.id);
  const close = () => {
    setOpen(false);
    setReason("");
  };

  if (!user.is_active) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-fg-2">Блокировка</p>
          <p className="text-xs text-muted">Аккаунт заблокирован</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          loading={unban.isPending}
          disabled={disabled}
          onClick={() =>
            unban.mutate(undefined, { onSuccess: () => toast.success("Пользователь разблокирован") })
          }
        >
          Разблокировать
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-fg-2">Блокировка</p>
          <p className="text-xs text-muted">Завершит все сессии пользователя</p>
        </div>
        <Button variant="danger" size="sm" disabled={disabled} onClick={() => setOpen(true)}>
          Заблокировать
        </Button>
      </div>

      <Modal open={open} onClose={close} title="Заблокировать пользователя">
        <Field label="Причина" hint="Необязательно — для журнала аудита">
          <Textarea
            rows={3}
            maxLength={2000}
            placeholder="За что блокируем"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
        <div className="mt-5 flex gap-2">
          <Button variant="ghost" fullWidth onClick={close} disabled={ban.isPending}>
            Отмена
          </Button>
          <Button
            variant="danger"
            fullWidth
            loading={ban.isPending}
            onClick={() =>
              ban.mutate(
                { reason: reason.trim() || null },
                {
                  onSuccess: () => {
                    toast.success("Пользователь заблокирован");
                    close();
                  },
                },
              )
            }
          >
            Заблокировать
          </Button>
        </div>
      </Modal>
    </>
  );
}

function DeleteControl({ user, disabled }: { user: AdminUserDetail; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const del = useDeleteUser(user.id);
  return (
    <>
      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <div>
          <p className="text-sm font-semibold text-danger">Удалить аккаунт</p>
          <p className="text-xs text-muted">Мягкое удаление с отзывом сессий</p>
        </div>
        <Button variant="danger" size="sm" disabled={disabled} onClick={() => setOpen(true)}>
          Удалить
        </Button>
      </div>
      <ConfirmDialog
        open={open}
        title="Удалить пользователя?"
        message="Аккаунт будет помечен удалённым, все сессии завершены. Действие фиксируется в аудите."
        confirmLabel="Удалить"
        destructive
        loading={del.isPending}
        onConfirm={() =>
          del.mutate(undefined, {
            onSuccess: () => {
              toast.success("Пользователь удалён");
              setOpen(false);
            },
          })
        }
        onClose={() => setOpen(false)}
      />
    </>
  );
}
