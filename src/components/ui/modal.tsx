"use client";

import { useEffect, useId, type ReactNode } from "react";

import { IconX } from "@/components/ui/icons";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const dialogRef = useFocusTrap<HTMLDivElement>(open);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 motion-safe:animate-[pu-fade_0.15s_ease-out]"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title != null ? titleId : undefined}
        aria-label={title == null ? "Диалог" : undefined}
        tabIndex={-1}
        className={cn(
          "outline-none",
          "relative w-full max-w-md rounded-t-lg border border-border bg-surface p-6 shadow-float sm:rounded-lg",
          "motion-safe:animate-[pu-pop_0.16s_ease-out]",
          className,
        )}
      >
        {title != null && (
          <div className="mb-3 flex items-start justify-between gap-4">
            <h2 id={titleId} className="text-lg font-extrabold tracking-[-0.01em] text-fg">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="-mt-1 -mr-1 inline-flex size-9 flex-none items-center justify-center rounded-full text-fg-2 hover:bg-surface-2"
            >
              <IconX size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
