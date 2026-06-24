import { getAccessToken } from "@/lib/auth/tokens";
import { getCsrfToken } from "@/lib/auth/csrf";
import type { ApiErrorEnvelope } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.pingup.pro";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public requestId: string | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const csrf = getCsrfToken();
  if (csrf) headers.set("X-CSRF-Token", csrf);

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const env = body as ApiErrorEnvelope | null;
    throw new ApiError(
      res.status,
      env?.error?.code ?? "HTTP_ERROR",
      env?.error?.message ?? res.statusText,
      env?.error?.request_id ?? res.headers.get("X-Request-ID"),
    );
  }

  return body as T;
}
