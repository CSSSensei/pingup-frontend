import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type {
  AccountRead,
  ChangeEmailPayload,
  ChangePasswordPayload,
  EmailChangeAccepted,
} from "@/types/api";

export const usersApi = {
  changeEmail: (payload: ChangeEmailPayload) =>
    apiFetch<EmailChangeAccepted>(`${API_PREFIX}/users/me/email`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  confirmEmailChange: (token: string) =>
    apiFetch<AccountRead>(`${API_PREFIX}/users/me/email/confirm`, {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  // 204 + бэк отзывает все сессии и чистит cookies → после успеха нужно разлогинить.
  changePassword: (payload: ChangePasswordPayload) =>
    apiFetch<void>(`${API_PREFIX}/users/me/password`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  setMarketingConsent: (marketing_consent: boolean) =>
    apiFetch<AccountRead>(`${API_PREFIX}/users/me/marketing-consent`, {
      method: "PATCH",
      body: JSON.stringify({ marketing_consent }),
    }),

  deleteAccount: (password: string) =>
    apiFetch<void>(`${API_PREFIX}/users/me`, {
      method: "DELETE",
      body: JSON.stringify({ password }),
    }),
};
