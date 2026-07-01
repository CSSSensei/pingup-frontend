import { getAccessToken } from "@/lib/auth/tokens";
import { getCsrfToken } from "@/lib/auth/csrf";
import { hardLogout, refreshAccessToken } from "@/lib/api/interceptors";
import type { ApiErrorDetail, ApiErrorEnvelope } from "@/types/api";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.pingup.pro";

// Запросы, которые НЕ должны триггерить refresh-ретрай (иначе зациклимся / убьём сессию).
const REFRESH_EXEMPT = ["/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh"];

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: ApiErrorDetail[] = [],
    public requestId: string | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retried = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData = init.body instanceof FormData;
  // Для FormData Content-Type не ставим — браузер сам добавит boundary.
  if (!isFormData && init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const csrf = getCsrfToken();
  if (csrf) headers.set("X-CSRF-Token", csrf);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers, credentials: "include" });

  if (res.status === 401 && !retried && !REFRESH_EXEMPT.some((p) => path.startsWith(p))) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiFetch<T>(path, init, true);
    hardLogout();
  }

  if (res.status === 204) return undefined as T;

  const body = (await res.json().catch(() => null)) as ApiErrorEnvelope | T | null;

  if (!res.ok) {
    const env = body as ApiErrorEnvelope | null;
    throw new ApiError(
      res.status,
      env?.error?.code ?? "HTTP_ERROR",
      env?.error?.message ?? res.statusText,
      env?.error?.details ?? [],
      env?.error?.request_id ?? res.headers.get("X-Request-ID"),
    );
  }

  return body as T;
}
