import { create } from "zustand";

type AuthStoreState = {
    isInitalizedAuth: boolean;
    initAuth: () => void;
    isLoggedIn: boolean;
    logIn: () => void;
    logOut: () => void;
};

export const useAuthStore = create<AuthStoreState>((set) => ({
    isLoggedIn: false,
    logIn: () => set({ isLoggedIn: true }),
    logOut: () => set({ isLoggedIn: false }),
    isInitalizedAuth : false,
    initAuth: () => set({isInitalizedAuth: true}),
}));

//ZUSTAND를 사용하기 위해서 zustand 깔기.
