import { create } from "zustand";

interface EmailGateState {
  open: boolean;
  show: () => void;
  hide: () => void;
}

export const useEmailGateStore = create<EmailGateState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
