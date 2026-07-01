"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authApi } from "@/lib/api/endpoints/auth";
import { useAuthStore } from "@/stores/auth";

export function useLogout() {
  const router = useRouter();
  const qc = useQueryClient();
  const clear = useAuthStore((s) => s.clear);
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout().catch(() => {});
    } finally {
      clear();
      qc.clear();
      router.push("/");
    }
  };

  return { logout, loading };
}
