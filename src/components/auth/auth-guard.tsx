"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { BallSpinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/stores/auth";

// Клиентский гейт (middleware — грубый по cookie): ждёт silent-refresh, затем
// пускает authed / уводит anon на /login?next=. idle|authenticating → спиннер.
export function AuthGuard({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anon") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  if (status === "authed") return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BallSpinner size={32} />
    </div>
  );
}
