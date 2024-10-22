import { create } from "zustand";

interface ActiveTabStoreState  {
    activeTab:string;
    setActiveTab: (tab:string) => void;
}

export const useActiveStore = create<ActiveTabStoreState>((set) =>  ({
    activeTab: '',
    setActiveTab: (tab) => set({activeTab: tab}),
}))