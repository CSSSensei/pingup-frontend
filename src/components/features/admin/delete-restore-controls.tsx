"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";

export function DeleteRestoreControls({
  deleted,
  entity,
  busy,
  onSoftDelete,
  onHardDelete,
  onRestore,
}: {
  deleted: boolean;
  entity: string;
  busy: boolean;
  onSoftDelete: () => void;
  onHardDelete: () => void;
  onRestore?: () => void;
}) {
  const [dialog, setDialog] = useState<"soft" | "hard" | null>(null);

  return (
    <>
      {deleted ? (
        <>
          {onRestore && (
            <Button variant="secondary" size="sm" disabled={busy} onClick={onRestore}>
              Восстановить
            </Button>
          )}
          <Button variant="danger" size="sm" disabled={busy} onClick={() => setDialog("hard")}>
            Удалить навсегда
          </Button>
        </>
      ) : (
        <Button variant="ghost" size="sm" disabled={busy} onClick={() => setDialog("soft")}>
          Удалить
        </Button>
      )}

      <ConfirmDialog
        open={dialog === "soft"}
        title={`Удалить ${entity}?`}
        message="Мягкое удаление — объект скроется, но его можно восстановить."
        confirmLabel="Удалить"
        destructive
        loading={busy}
        onConfirm={() => {
          onSoftDelete();
          setDialog(null);
        }}
        onClose={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === "hard"}
        title={`Удалить ${entity} навсегда?`}
        message="Необратимое удаление из базы. Восстановить будет нельзя."
        confirmLabel="Удалить навсегда"
        destructive
        loading={busy}
        onConfirm={() => {
          onHardDelete();
          setDialog(null);
        }}
        onClose={() => setDialog(null)}
      />
    </>
  );
}
