"use client";

import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/lib/api/endpoints/auth";
import { qk } from "@/lib/queryKeys";
import { useAuthStore } from "@/stores/auth";

export function useMe() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.me,
    queryFn: authApi.me,
    enabled: status === "authed",
    staleTime: 5 * 60_000,
  });
}

export function useAuthStatus() {
  return useAuthStore((s) => s.status);
}
