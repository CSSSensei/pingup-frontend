"use client";

import { useState } from "react";

import { ErrorState } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { IconTrash } from "@/components/ui/icons";
import { useVenueStaff, useVenueStaffActions } from "@/hooks/useAdmin";
import type { VenueStaffRead, VenueStaffRole } from "@/types/api";

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

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<VenueStaffRole>("caretaker");

  const submit = () => {
    const id = Number(userId);
    if (!Number.isInteger(id) || id <= 0) {
      toast.error("Укажите корректный ID пользователя");
      return;
    }
    actions.add.mutate(
      { user_id: id, role },
      {
        onSuccess: () => {
          toast.success("Персонал назначен");
          setUserId("");
        },
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title={`Персонал · ${venueName}`}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <Field label="ID пользователя" hint="Из /admin/users" className="flex-1">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="123"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </Field>
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
