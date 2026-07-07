import { create } from "zustand";

export type ConsentValue = "granted" | "denied";

const STORAGE_KEY = "pingup_cookie_consent";

interface ConsentState {
  consent: ConsentValue | null;
  hydrated: boolean;
  hydrate: () => void;
  decide: (value: ConsentValue) => void;
}

export const useConsentStore = create<ConsentState>((set) => ({
  consent: null,
  hydrated: false,
  hydrate: () => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    set({
      consent: stored === "granted" || stored === "denied" ? stored : null,
      hydrated: true,
    });
  },
  decide: (value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, value);
    }
    set({ consent: value, hydrated: true });
  },
}));
