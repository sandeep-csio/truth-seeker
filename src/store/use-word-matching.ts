import { create } from "zustand";

interface wordMatchingStore {
  isEnabled: boolean;
  set: (value: boolean) => void;
}

export const useWordsMatchingStore = create<wordMatchingStore>((set) => ({
    isEnabled: false,
    set: (value) => set({ isEnabled: value }),
}));
