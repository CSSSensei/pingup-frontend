"use client";

import { type ReactNode } from "react";

import { EmptyState } from "@/components/common/states";
import { LinkButton } from "@/components/ui/link-button";
import { BallSpinner } from "@/components/ui/spinner";
import { IconShieldCheck } from "@/components/ui/icons";
import { useMe } from "@/hooks/useMe";
import { hasRole } from "@/lib/roles";
import type { UserRole } from "@/types/api";

// Клиентский гейт по роли — ТОЛЬКО для UI (настоящая проверка на бэке).
// Ставится под AppShell → AuthGuard уже гарантировал вход; ждём загрузку /auth/me.
export function RoleGuard({ min, children }: { min: UserRole; children: ReactNode }) {
  const { data: me, isPending } = useMe();

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <BallSpinner size={32} />
      </div>
    );
  }

  if (!hasRole(me?.role, min)) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12">
        <EmptyState
          icon={<IconShieldCheck size={30} />}
          title="Нет доступа"
          description={
            min === "admin"
              ? "Этот раздел доступен только администраторам."
              : "Этот раздел доступен только модераторам."
          }
          action={
            <LinkButton href="/games" variant="secondary" size="sm">
              На главную
            </LinkButton>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}
