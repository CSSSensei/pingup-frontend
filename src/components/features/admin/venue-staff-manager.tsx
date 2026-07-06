"use client";

import { useEffect, useState } from "react";

import { SearchSelect } from "@/components/features/admin/search-select";
import { ErrorState } from "@/components/common/states";
import { Avatar } from "@/components/common/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { IconTrash, IconX } from "@/components/ui/icons";
import { useAdminUsers, useVenueStaff, useVenueStaffActions } from "@/hooks/useAdmin";
import type { AdminUserRead, VenueStaffRead, VenueStaffRole } from "@/types/api";

const ROLE_LABELS: Record<VenueStaffRole, string> = {
  caretaker: "Завхоз",
  moderator: "Модератор зала",
};

export function VenueStaffModal({
  venueId,
  venueName,
  open,
  onClose,
}: {
  venueId: number;
  venueName: string;
  open: boolean;
  onClose: () => void;
}) {
  const staff = useVenueStaff(venueId, open);
  const actions = useVenueStaffActions(venueId);

  const [selected, setSelected] = useState<{ id: number; label: string } | null>(null);
  const [role, setRole] = useState<VenueStaffRole>("caretaker");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);
  const results = useAdminUsers({ ...(q.length >= 2 ? { q } : {}), limit: 8 });

  const submit = () => {
    if (!selected) {
      toast.error("Выберите пользователя");
      return;
    }
    actions.add.mutate(
      { user_id: selected.id, role },
      {
        onSuccess: () => {
          toast.success("Персонал назначен");
          setSelected(null);
          setSearch("");
          setQ("");
        },
      },
    );
  };

  const userLabel = (u: AdminUserRead) => u.profile?.display_name ?? u.email;

  return (
    <Modal open={open} onClose={onClose} title={`Персонал · ${venueName}`}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[200px] flex-1">
            <p className="mb-1.5 text-sm font-semibold text-fg-2">Пользователь</p>
            {selected ? (
              <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3">
                <span className="truncate text-sm font-semibold text-fg">{selected.label}</span>
                <button
                  type="button"
                  aria-label="Сбросить"
                  className="flex-none text-muted hover:text-fg"
                  onClick={() => setSelected(null)}
                >
                  <IconX size={15} />
                </button>
              </div>
            ) : (
              <SearchSelect<AdminUserRead>
                query={search}
                onQueryChange={setSearch}
                items={results.data?.items ?? []}
                isLoading={results.isFetching}
                getKey={(u) => u.id}
                onPick={(u) => setSelected({ id: u.id, label: userLabel(u) })}
                placeholder="Имя или email"
                renderItem={(u) => (
                  <>
                    <Avatar src={u.profile?.avatar_url ?? null} name={userLabel(u)} size={26} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-fg">{userLabel(u)}</span>
                      <span className="block truncate text-xs text-muted">{u.email}</span>
                    </span>
                  </>
                )}
              />
            )}
          </div>
          <Select
            aria-label="Роль"
            className="max-w-[170px]"
            value={role}
            onChange={(e) => setRole(e.target.value as VenueStaffRole)}
          >
            <option value="caretaker">Завхоз</option>
            <option value="moderator">Модератор зала</option>
          </Select>
          <Button size="sm" loading={actions.add.isPending} onClick={submit}>
            Назначить
          </Button>
        </div>

        <div className="border-t border-border pt-3">
          {staff.isPending ? (
            <Skeleton className="h-20 w-full" />
          ) : staff.isError ? (
            <ErrorState onRetry={() => staff.refetch()} />
          ) : (staff.data ?? []).length === 0 ? (
            <p className="py-2 text-sm text-muted">Персонал не назначен.</p>
          ) : (
            <div className="divide-y divide-border">
              {staff.data!.map((s) => (
                <StaffRow
                  key={s.id}
                  staff={s}
                  busy={
                    actions.remove.isPending &&
                    actions.remove.variables?.userId === s.user_id &&
                    actions.remove.variables?.role === s.role
                  }
                  onRemove={() =>
                    actions.remove.mutate(
                      { userId: s.user_id, role: s.role },
                      { onSuccess: () => toast.success("Снят с зала") },
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function StaffRow({
  staff,
  busy,
  onRemove,
}: {
  staff: VenueStaffRead;
  busy: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-fg">
            {staff.display_name ?? staff.email ?? `#${staff.user_id}`}
          </span>
          <Badge className="bg-primary-tint text-primary">{ROLE_LABELS[staff.role]}</Badge>
        </div>
        <p className="text-xs text-muted">
          {staff.email ?? ""} · #{staff.user_id}
        </p>
      </div>
      <Button variant="ghost" size="sm" loading={busy} onClick={onRemove} aria-label="Снять">
        <IconTrash size={15} />
      </Button>
    </div>
  );
}
