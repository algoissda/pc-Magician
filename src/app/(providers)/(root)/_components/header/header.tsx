/* eslint-disable react/no-unescaped-entities */
"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../../../../../supabase/client";
import { useAuthStore } from "../../../../../../zustand/auth.store";
import Modal from "../modal/modal"; //모달 페이지 가져오기
import { useThemeStore } from "@/store/useStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Font Awesome 가져오기
import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";

// 테마 전환 버튼 컴포넌트
const ThemeToggleButton = ({ theme, toggleTheme }: any) => {
  return (
    <button
      onClick={toggleTheme}
      className={`${
        theme === "dark" ? "bg-white" : "bg-black"
      } w-10 h-10 rounded-full flex justify-center items-center p-[1px]`}
    >
      <FontAwesomeIcon
        className={`${
          theme === "dark" ? "bg-black text-white" : "bg-white"
        } w-9 h-9 rounded-full text-3xl`}
        icon={theme === "dark" ? faSun : faMoon}
      />
    </button>
  );
};

// 인증 관련 버튼 컴포넌트 (로그인/로그아웃)
const AuthButtons = ({
  isLoggedIn,
  handleClickLogOutButton,
  setIsModalOpen,
  isModalOpen,
}: any) => {
  return isLoggedIn ? (
    <ul>
      <li className="text-[18px] font-medium text-white">
        <Link href={"/my/SavedBuild"}>
          <button className="mr-8">My Saved Builds</button>
        </Link>
        <button
          className="border text-black font-serif font-bold text-[20px] border-b-white bg-white rounded-3xl p-2 px-3"
          onClick={handleClickLogOutButton}
        >
          log-out
        </button>
      </li>
    </ul>
  ) : (
    <>
      <nav className="ml-5">
        <ul>
          <li className="border text-black font-serif font-bold text-[20px] border-b-white bg-white rounded-3xl p-2 px-3">
            <button onClick={() => setIsModalOpen(true)}>log-in</button>
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <p>
                아이디가 없으신가요?&emsp;
                <Link
                  href={"/auth/sign_up"}
                  className="text-blue-500"
                  onClick={() => setIsModalOpen(false)}
                >
                  회원가입 하러 가기
                </Link>
              </p>
            </Modal>
          </li>
        </ul>
      </nav>
      <nav className="ml-5">
        <ul>
          <li className="border text-black font-serif font-bold text-[20px] border-b-white bg-white rounded-3xl p-2 px-3">
            <Link href={"/auth/sign_up"}>sign-up</Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

// 헤더 내부 콘텐츠 컴포넌트
const HeaderContent = ({
  theme,
  handleClickPartListButton,
  handleClickLogOutButton,
  isInitalizedAuth,
  isLoggedIn,
  setIsModalOpen,
  isModalOpen,
  toggleTheme,
}: any) => {
  return (
    <header
      className={`sticky top-0 h-[100px] border-b-[3px] ${
        theme === "dark"
          ? "border-b-gray-400 bg-[#0d1117]"
          : "border-b-gray-300 bg-white"
      } shadow-md flex items-center px-16 z-10 shrink-0`}
    >
      <Link
        className={`main-text ${
          theme === "dark" ? "text-white" : "text-black"
        } text-[40px] font-extrabold text-center font-serif`}
        href="/"
      >
        PC Magician
      </Link>
      <nav className="ml-5">
        <ul>
          <li
            className={`text-[18px] ml-[70px] ${
              theme === "dark" ? "text-white" : "text-gray-700"
            }`}
          >
            <button onClick={handleClickPartListButton}>
              Today's Part Prices
            </button>
          </li>
        </ul>
      </nav>
      <div className="ml-auto flex items-center gap-x-4">
        {isInitalizedAuth && (
          <>
            <AuthButtons
              isLoggedIn={isLoggedIn}
              handleClickLogOutButton={handleClickLogOutButton}
              setIsModalOpen={setIsModalOpen}
              isModalOpen={isModalOpen}
            />
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
          </>
        )}
      </div>
    </header>
  );
};

function Header() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logOut = useAuthStore((state) => state.logOut);
  const isInitalizedAuth = useAuthStore((state) => state.isInitalizedAuth);

  const handleClickLogOutButton = async () => {
    await supabase.auth.signOut();
    logOut();
    alert("로그아웃되었습니다");
  };

  const handleClickPartListButton = () => router.push("/my/partlist");

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <HeaderContent
      theme={theme}
      handleClickPartListButton={handleClickPartListButton}
      handleClickLogOutButton={handleClickLogOutButton}
      isInitalizedAuth={isInitalizedAuth}
      isLoggedIn={isLoggedIn}
      setIsModalOpen={setIsModalOpen}
      isModalOpen={isModalOpen}
      toggleTheme={toggleTheme}
    />
  );
}

export default Header;
