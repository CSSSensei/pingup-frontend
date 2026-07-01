import { getCsrfToken } from "@/lib/auth/csrf";
import { setAccessToken } from "@/lib/auth/tokens";
import { useAuthStore } from "@/stores/auth";
import type { AuthSession } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.pingup.pro";

// Один in-flight refresh на все параллельные 401 — иначе reuse-detection бэкенда
// отзовёт всю токен-семью. Промис делится между конкурентными вызовами.
let inFlight: Promise<boolean> | null = null;

export function refreshAccessToken(): Promise<boolean> {
  inFlight ??= doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function doRefresh(): Promise<boolean> {
  try {
    const headers = new Headers({ "Content-Type": "application/json" });
    const csrf = getCsrfToken();
    if (csrf) headers.set("X-CSRF-Token", csrf);

    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers,
      credentials: "include",
    });
    if (!res.ok) return false;

    const body = (await res.json().catch(() => null)) as AuthSession | null;
    if (!body?.access_token) return false;

    setAccessToken(body.access_token);
    return true;
  } catch {
    return false;
  }
}

export function hardLogout(): void {
  useAuthStore.getState().clear();
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  const next = window.location.pathname + window.location.search;
  window.location.href = `/login?next=${encodeURIComponent(next)}`;
}
