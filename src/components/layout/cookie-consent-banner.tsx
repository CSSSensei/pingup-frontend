"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useConsentStore } from "@/stores/consent";

export function CookieConsentBanner() {
  const consent = useConsentStore((s) => s.consent);
  const hydrated = useConsentStore((s) => s.hydrated);
  const hydrate = useConsentStore((s) => s.hydrate);
  const decide = useConsentStore((s) => s.decide);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Согласие на использование cookie"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 px-4 py-3.5 shadow-card backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-snug text-fg-2">
          Мы используем cookie, чтобы сайт работал удобнее и быстрее. Подробнее — в{" "}
          <Link
            href="/legal/privacy"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Политике конфиденциальности
          </Link>
          .
        </p>
        <div className="flex flex-none gap-2">
          <Button variant="secondary" size="sm" onClick={() => decide("denied")}>
            Отклонить
          </Button>
          <Button variant="primary" size="sm" onClick={() => decide("granted")}>
            Принять
          </Button>
        </div>
      </div>
    </div>
  );
}
