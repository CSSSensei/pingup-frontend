"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { IconLogOut, IconX } from "@/components/ui/icons";
import { useLogout } from "@/hooks/useAuth";
import { MORE_SHEET, isActivePath } from "@/components/layout/nav-config";
import { cn } from "@/lib/utils";

export function MoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { logout } = useLogout();

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
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Меню">
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 motion-safe:animate-[pu-fade_0.15s_ease-out]"
      />
      <div className="absolute inset-x-0 bottom-0 rounded-t-lg border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-float motion-safe:animate-[pu-toast_0.2s_ease-out]">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-bold text-fg">Ещё</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="inline-flex size-9 items-center justify-center rounded-full text-fg-2 hover:bg-surface-2"
          >
            <IconX size={18} />
          </button>
        </div>
        <nav className="grid grid-cols-3 gap-1 px-3 pb-3">
          {MORE_SHEET.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-xs font-semibold transition-colors",
                  active ? "bg-primary-tint text-primary" : "text-fg-2 hover:bg-surface-2",
                )}
              >
                <item.icon size={22} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-danger hover:bg-surface-2"
          >
            <IconLogOut size={18} />
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
