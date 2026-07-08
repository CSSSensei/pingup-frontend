import type { ReactNode } from "react";

import { NavShell } from "@/components/layout/nav-shell";
import { cn } from "@/lib/utils";

// Публичные страницы каталога — тот же навигационный хром, что и в приложении,
// но без AuthGuard. Шелл сам адаптирует топбар/сайдбар под гостя.
export function PublicShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <NavShell>
      <div
        className={cn("mx-auto w-full max-w-5xl px-4 py-6 sm:py-8", className)}
      >
        {children}
      </div>
    </NavShell>
  );
}
