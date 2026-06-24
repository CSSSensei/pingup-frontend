import { useAuthStore } from "@/stores/auth";

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

export function setAccessToken(token: string | null): void {
  useAuthStore.getState().setAccessToken(token);
}
