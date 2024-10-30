import { create } from "zustand";

type Theme = "dark" | "light";

type ThemeState = {
  theme: Theme;
  setTheme: (newTheme : Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "dark", // 초기 값 설정
  setTheme: (newTheme) => set({ theme: newTheme }), // 테마 설정 함수
}));
