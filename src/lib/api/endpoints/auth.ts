import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type { AuthSession, LoginPayload, MeResponse, RegisterPayload } from "@/types/api";

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthSession>(`${API_PREFIX}/auth/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    apiFetch<AuthSession>(`${API_PREFIX}/auth/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () => apiFetch<void>(`${API_PREFIX}/auth/logout`, { method: "POST" }),

  me: () => apiFetch<MeResponse>(`${API_PREFIX}/auth/me`),

  resendVerification: () =>
    apiFetch<void>(`${API_PREFIX}/auth/verify-email/resend`, { method: "POST" }),
};
