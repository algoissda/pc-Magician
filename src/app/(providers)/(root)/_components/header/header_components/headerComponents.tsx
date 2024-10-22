// headerComponents.tsx
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";
import Modal from "../modal/modal"; // 모달 페이지 가져오기
import { useState } from "react";

export const HeaderButton = ({ children, href, onClick }: any) => (
  <Link href={href}>
    <button
      onClick={onClick}
      className="main-text text-[40px] font-extrabold font-serif"
    >
      {children}
    </button>
  </Link>
);

export const AuthButtons = ({
  isLoggedIn,
  handleLogOut,
  isModalOpen,
  setIsModalOpen,
}: any) => {
  return isLoggedIn ? (
    <ul>
      <li className="text-[18px] font-medium">
        <Link href="/my/SavedBuild">
          <button className="mr-8">My Saved Builds</button>
        </Link>
        <button
          className="border text-black font-serif font-bold text-[20px] border-b-white bg-white rounded-3xl p-2 px-3"
          onClick={handleLogOut}
        >
          log-out
        </button>
      </li>
    </ul>
  ) : (
    <>
      <nav className="ml-5">
        <ul>
          <li className="border font-serif font-bold text-[20px] border-b-white bg-white rounded-3xl p-2 px-3">
            <button onClick={() => setIsModalOpen(true)}>log-in</button>
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <p>
                아이디가 없으신가요?&emsp;
                <Link
                  href="/auth/sign_up"
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
          <li className="border font-serif font-bold text-[20px] border-b-white bg-white rounded-3xl p-2 px-3">
            <Link href="/auth/sign_up">sign-up</Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export const ThemeToggleButton = ({ theme, toggleTheme }: any) => {
  return (
    <button
      onClick={toggleTheme}
      className={`bg-${
        theme === "dark" ? "white" : "black"
      } w-10 h-10 rounded-full flex justify-center items-center p-[1px]`}
    >
      <FontAwesomeIcon
        className={`bg-${
          theme === "dark" ? "black" : "white"
        } w-9 h-9 rounded-full text-3xl`}
        icon={theme === "dark" ? faSun : faMoon}
      />
    </button>
  );
};
