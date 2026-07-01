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

  verifyEmail: (token: string) =>
    apiFetch<void>(`${API_PREFIX}/auth/verify-email`, {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  resendVerification: () =>
    apiFetch<void>(`${API_PREFIX}/auth/verify-email/resend`, { method: "POST" }),

  requestPasswordReset: (email: string) =>
    apiFetch<void>(`${API_PREFIX}/auth/password-reset/request`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  confirmPasswordReset: (token: string, newPassword: string) =>
    apiFetch<void>(`${API_PREFIX}/auth/password-reset/confirm`, {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    }),
};
