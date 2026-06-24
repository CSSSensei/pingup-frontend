import Link from "next/link";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="mx-auto flex max-w-4xl gap-4 p-4 text-sm">
          <Link href="/profile">Профиль</Link>
          <Link href="/events">События</Link>
          <Link href="/partners">Напарники</Link>
          <Link href="/notifications">Уведомления</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
