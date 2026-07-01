"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { NavShell } from "@/components/layout/nav-shell";

// Онбординг — сфокусированный визард без навигационного хрома.
const BARE_ROUTES = ["/onboarding"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <NavShell>{children}</NavShell>
    </AuthGuard>
  );
}
