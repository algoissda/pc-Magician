import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: "dark", // 초기 값 설정
  setTheme: (newTheme: string) => set({ theme: newTheme }), // 테마 설정 함수
}));
