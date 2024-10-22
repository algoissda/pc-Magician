import { create } from "zustand";

export const useActiveStore = create((set) => ({
  activeTab: "",
  setActiveTab: (tab: string) => set({ activeTab: tab }),
}));
