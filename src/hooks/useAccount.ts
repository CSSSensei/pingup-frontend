"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApi } from "@/lib/api/endpoints/auth";
import { usersApi } from "@/lib/api/endpoints/users";
import { qk } from "@/lib/queryKeys";
import { useAuthStore } from "@/stores/auth";
import type { ChangeEmailPayload, ChangePasswordPayload, MeResponse } from "@/types/api";

export function useChangeEmail() {
  return useMutation({ mutationFn: (p: ChangeEmailPayload) => usersApi.changeEmail(p) });
}

export function useChangePassword() {
  return useMutation({ mutationFn: (p: ChangePasswordPayload) => usersApi.changePassword(p) });
}

export function useDeleteAccount() {
  return useMutation({ mutationFn: (password: string) => usersApi.deleteAccount(password) });
}

export function useResendVerification() {
  return useMutation({ mutationFn: () => authApi.resendVerification() });
}

export function useSetMarketingConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (value: boolean) => usersApi.setMarketingConsent(value),
    onMutate: async (value) => {
      await qc.cancelQueries({ queryKey: qk.me });
      const prev = qc.getQueryData<MeResponse>(qk.me);
      if (prev) qc.setQueryData<MeResponse>(qk.me, { ...prev, marketing_consent: value });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.me, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.me }),
  });
}

export function useSessions() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.sessions,
    queryFn: authApi.sessions,
    enabled: status === "authed",
    staleTime: 30_000,
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (familyId: string) => authApi.revokeSession(familyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.sessions }),
  });
}

export function useLogoutAll() {
  return useMutation({ mutationFn: () => authApi.logoutAll() });
}
