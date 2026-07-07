import Link from "next/link";

import { Avatar } from "@/components/common/avatar";
import { Badge, UserRoleBadge } from "@/components/ui/badge";
import type { AdminUserRead } from "@/types/api";

export function AdminUserCard({ user }: { user: AdminUserRead }) {
  const name = user.profile?.display_name ?? user.email;

  return (
    <Link
      href={`/admin/users/${user.id}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:bg-surface-2"
    >
      <Avatar src={user.profile?.avatar_url ?? null} name={name} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-bold text-fg">{name}</p>
          <UserRoleBadge role={user.role} />
          {user.is_superuser && (
            <Badge className="bg-primary-tint text-primary">super</Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
      </div>
      <div className="flex flex-none flex-col items-end gap-1">
        {user.deleted_at ? (
          <Badge className="bg-status-cancelled/12 text-status-cancelled">Удалён</Badge>
        ) : !user.is_active ? (
          <Badge className="bg-status-declined/12 text-status-declined">Заблокирован</Badge>
        ) : !user.is_email_verified ? (
          <Badge className="bg-status-pending/12 text-status-pending">Email не подтверждён</Badge>
        ) : null}
        <span className="text-xs text-muted">#{user.id}</span>
      </div>
    </Link>
  );
}
