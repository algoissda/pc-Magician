import { create } from "zustand";

interface ActiveTabState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useActiveStore = create<ActiveTabState>((set) => ({
  activeTab: "",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
