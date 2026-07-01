import type { ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

export function PublicShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <>
      <SiteHeader />
      <main className={cn("mx-auto w-full max-w-3xl px-4 py-6 sm:py-8", className)}>{children}</main>
    </>
  );
}
