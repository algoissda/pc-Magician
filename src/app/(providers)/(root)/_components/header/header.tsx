// header.tsx
"use client";
import { useState } from "react";
import { supabase } from "../../../../../../supabase/client";
import { useAuthStore } from "../../../../../../zustand/auth.store";
import { useThemeStore } from "@/store/useStore";
import { useActiveStore } from "@/store/useActiveTab";
import { AuthButtons } from "./headerComponents/AuthButtons";
import { HeaderButton } from "./headerComponents/HeaderButton";
import { ThemeToggleButton } from "./headerComponents/ThemeToggleButton";

function Header() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const setActiveTab = useActiveStore((state) => state.setActiveTab);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logOut = useAuthStore((state) => state.logOut);
  const isInitalizedAuth = useAuthStore((state) => state.isInitalizedAuth);

  // 테마 전환 함수
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // 로그아웃 처리 함수
  const handleClickLogOutButton = async () => {
    await supabase.auth.signOut();
    logOut();
    alert("로그아웃되었습니다");
  };

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 h-[100px] border-b-[3px] shadow-md z-10 flex items-center px-16 shrink-0 ${
        theme === "dark"
          ? "bg-[#0d1117] border-b-gray-400 shadow-black"
          : "bg-white border-b-gray-300 shadow-gray-200"
      }`}
    >
      <button onClick={() => setActiveTab("")}>
        <HeaderButton href="/" theme={theme}>
          PC Magician
        </HeaderButton>
      </button>
      <nav className="ml-5"></nav>
      <div className="ml-auto flex items-center gap-x-4">
        {isInitalizedAuth && (
          <>
            <AuthButtons
              isLoggedIn={isLoggedIn}
              handleLogOut={handleClickLogOutButton}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              theme={theme}
            />
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
