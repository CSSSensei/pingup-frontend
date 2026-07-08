"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { IconShieldCheck } from "@/components/ui/icons";
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
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:justify-end sm:px-5 sm:pb-5">
      <div
        role="region"
        aria-label="Согласие на использование cookie"
        className="w-full max-w-md rounded-lg border border-border bg-surface/95 p-4 shadow-float backdrop-blur-md motion-safe:animate-[pu-toast_0.28s_cubic-bezier(0.22,1,0.36,1)] sm:p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-9 flex-none items-center justify-center rounded-full bg-primary-tint text-primary">
            <IconShieldCheck size={18} />
          </div>
          <p className="text-[13px] leading-relaxed text-fg-2">
            Мы используем cookie, чтобы сайт был удобнее и работал быстрее.
            Подробнее — в{" "}
            <Link
              href="/legal/privacy"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Политике конфиденциальности
            </Link>
            .
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => decide("denied")}
          >
            Отклонить
          </Button>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => decide("granted")}
          >
            Принять
          </Button>
        </div>
      </div>
    </div>
  );
}
