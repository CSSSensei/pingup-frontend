import { create } from "zustand";

// idle — до bootstrap; authenticating — идёт silent-refresh; authed/anon — итог.
export type AuthStatus = "idle" | "authenticating" | "authed" | "anon";

interface AuthState {
  accessToken: string | null;
  status: AuthStatus;
  setAccessToken: (token: string | null) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
}

// Access-токен — только в памяти (refresh живёт в httpOnly cookie).
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  status: "idle",
  setAccessToken: (token) => set({ accessToken: token, status: token ? "authed" : "anon" }),
  setStatus: (status) => set({ status }),
  clear: () => set({ accessToken: null, status: "anon" }),
}));
