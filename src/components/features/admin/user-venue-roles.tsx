"use client";

import { useEffect, useState } from "react";

import { SearchSelect } from "@/components/features/admin/search-select";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { IconTrash, IconX } from "@/components/ui/icons";
import { useAdminVenues, useUserVenueRoleActions, useUserVenueRoles } from "@/hooks/useAdmin";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import type { VenueRead, VenueStaffRole } from "@/types/api";

const ROLE_LABELS: Record<VenueStaffRole, string> = {
  caretaker: "Завхоз",
  moderator: "Модератор зала",
};

export function UserVenueRolesSection({ userId }: { userId: number }) {
  const roles = useUserVenueRoles(userId);
  const actions = useUserVenueRoleActions(userId);

  const [selected, setSelected] = useState<{ id: number; label: string } | null>(null);
  const [role, setRole] = useState<VenueStaffRole>("caretaker");
  const [removeTarget, setRemoveTarget] = useState<{
    venueId: number;
    role: VenueStaffRole;
    name: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);
  const venues = useAdminVenues({
    city_id: SMOLENSK_CITY_ID,
    ...(q.length >= 2 ? { q } : {}),
    limit: 8,
  });

  const submit = () => {
    if (!selected) {
      toast.error("Выберите зал");
      return;
    }
    actions.add.mutate(
      { venueId: selected.id, role },
      {
        onSuccess: () => {
          toast.success("Роль в зале назначена");
          setSelected(null);
          setSearch("");
          setQ("");
        },
      },
    );
  };

  const items = roles.data ?? [];

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <div>
        <h2 className="text-sm font-bold text-fg-2">Роли в залах</h2>
        <p className="mt-0.5 text-xs text-muted">Назначение завхозом или модератором конкретного зала</p>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1">
          <p className="mb-1.5 text-sm font-semibold text-fg-2">Зал</p>
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
            <SearchSelect<VenueRead>
              query={search}
              onQueryChange={setSearch}
              items={venues.data?.items ?? []}
              isLoading={venues.isFetching}
              getKey={(v) => v.id}
              onPick={(v) => setSelected({ id: v.id, label: v.name })}
              placeholder="Название зала"
              renderItem={(v) => (
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-fg">{v.name}</span>
                  <span className="block truncate text-xs text-muted">{v.address}</span>
                </span>
              )}
            />
          )}
        </div>
        <Select
          aria-label="Роль в зале"
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
        {roles.isPending ? (
          <Skeleton className="h-16 w-full" />
        ) : roles.isError ? (
          <ErrorState onRetry={() => roles.refetch()} />
        ) : items.length === 0 ? (
          <p className="py-1 text-sm text-muted">Ролей в залах нет.</p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((r) => {
              const busy =
                actions.remove.isPending &&
                actions.remove.variables?.venueId === r.venue_id &&
                actions.remove.variables?.role === r.role;
              return (
                <div
                  key={`${r.venue_id}-${r.role}`}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-semibold text-fg">{r.venue_name}</span>
                    <Badge className="bg-primary-tint text-primary">{ROLE_LABELS[r.role]}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={busy}
                    aria-label="Снять роль"
                    onClick={() =>
                      setRemoveTarget({ venueId: r.venue_id, role: r.role, name: r.venue_name })
                    }
                  >
                    <IconTrash size={15} />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={removeTarget !== null}
        title="Снять роль в зале?"
        message={removeTarget ? `${ROLE_LABELS[removeTarget.role]} · ${removeTarget.name}` : undefined}
        confirmLabel="Снять"
        destructive
        loading={actions.remove.isPending}
        onConfirm={() =>
          removeTarget &&
          actions.remove.mutate(
            { venueId: removeTarget.venueId, role: removeTarget.role },
            {
              onSuccess: () => {
                toast.success("Роль снята");
                setRemoveTarget(null);
              },
            },
          )
        }
        onClose={() => setRemoveTarget(null)}
      />
    </section>
  );
}
