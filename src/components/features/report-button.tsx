"use client";

import Link from "next/link";
import { useState } from "react";

import { ReportDialog } from "@/components/features/report-dialog";
import { IconFlag } from "@/components/ui/icons";
import { useAuthStatus, useMe } from "@/hooks/useMe";
import type { ReportTargetType } from "@/lib/enums";
import { cn } from "@/lib/utils";

const triggerClass =
  "inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-danger";

// Ненавязчивая ссылка «Пожаловаться». Гость → на логин; свою цель (ownerId===me.id) скрываем.
export function ReportButton({
  targetType,
  targetId,
  loginNext,
  ownerId,
  className,
}: {
  targetType: ReportTargetType;
  targetId: number;
  loginNext: string;
  ownerId?: number | null;
  className?: string;
}) {
  const status = useAuthStatus();
  const { data: me } = useMe();
  const [open, setOpen] = useState(false);

  if (status === "idle" || status === "authenticating") return null;
  if (status === "authed" && ownerId != null && me?.id === ownerId) return null;

  if (status !== "authed") {
    return (
      <Link href={`/login?next=${encodeURIComponent(loginNext)}`} className={cn(triggerClass, className)}>
        <IconFlag size={14} />
        Пожаловаться
      </Link>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn(triggerClass, className)}>
        <IconFlag size={14} />
        Пожаловаться
      </button>
      {open && (
        <ReportDialog
          key={`${targetType}-${targetId}`}
          open
          onClose={() => setOpen(false)}
          targetType={targetType}
          targetId={targetId}
        />
      )}
    </>
  );
}
