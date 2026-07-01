"use client";

import { useEffect } from "react";

import { refreshAccessToken } from "@/lib/api/interceptors";
import { hasSessionCookie } from "@/lib/auth/session";
import { getAccessToken } from "@/lib/auth/tokens";
import { useAuthStore } from "@/stores/auth";

// has_session=1 без токена в памяти = перезагрузка страницы: поднимаем сессию одним refresh.
export function AuthBootstrap() {
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    let cancelled = false;

    if (getAccessToken()) {
      setStatus("authed");
      return;
    }
    if (!hasSessionCookie()) {
      setStatus("anon");
      return;
    }

    setStatus("authenticating");
    refreshAccessToken().then((ok) => {
      if (cancelled) return;
      setStatus(ok ? "authed" : "anon");
    });

    return () => {
      cancelled = true;
    };
  }, [setStatus]);

  return null;
}
