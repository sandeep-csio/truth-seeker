import { create } from "zustand";

interface ProgressStore {
  progressValue: number;
  set: (value: number) => void;
}

export const useProgressStore = create<ProgressStore>((set) => ({
  progressValue: 0,
  set: (value) => set({ progressValue: value }),
}));
