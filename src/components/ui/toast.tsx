"use client";

import { create } from "zustand";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error";
interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  leaving: boolean;
}

interface ToastState {
  toasts: ToastItem[];
  push: (message: string, variant: ToastVariant) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

// Держим unmount на длину exit-анимации, иначе тост исчезает рывком.
const LIFETIME_MS = 3200;
const EXIT_MS = 200;

const useToastStore = create<ToastState>((set) => {
  const startLeave = (id: number) => {
    set((s) => ({ toasts: s.toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)) }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), EXIT_MS);
  };
  return {
    toasts: [],
    push: (message, variant) => {
      const id = ++counter;
      set((s) => ({ toasts: [...s.toasts, { id, message, variant, leaving: false }] }));
      setTimeout(() => startLeave(id), LIFETIME_MS);
    },
    dismiss: startLeave,
  };
});

export const toast = Object.assign(
  (message: string) => useToastStore.getState().push(message, "default"),
  {
    success: (message: string) => useToastStore.getState().push(message, "success"),
    error: (message: string) => useToastStore.getState().push(message, "error"),
  },
);

const DOT: Record<ToastVariant, string> = {
  default: "bg-primary",
  success: "bg-status-confirmed",
  error: "bg-status-cancelled",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={cn(
            "pointer-events-auto flex max-w-[90vw] items-center gap-2.5 rounded px-4 py-3",
            "bg-fg text-sm font-semibold text-white shadow-float",
            t.leaving
              ? "motion-safe:animate-[pu-toast-out_0.2s_ease-in_forwards]"
              : "motion-safe:animate-[pu-toast_0.2s_cubic-bezier(0.22,1,0.36,1)]",
          )}
        >
          <span className={cn("size-2 flex-none rounded-full", DOT[t.variant])} />
          {t.message}
        </button>
      ))}
    </div>
  );
}
