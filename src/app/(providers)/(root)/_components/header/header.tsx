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
import { faMoon } from "@fortawesome/free-regular-svg-icons";
import { faSun } from "@fortawesome/free-regular-svg-icons";
import router from "next/router";

function Header() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  // 테마 전환 함수
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    console.log(`Theme changed to: ${theme}`); // 확인용 로그
  };

  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logOut = useAuthStore((state) => state.logOut);
  const isInitalizedAuth = useAuthStore((state) => state.isInitalizedAuth);

  //로그아웃 버튼 눌렀을 때 로그아웃 되게
  const handleClickLogOutButton = async () => {
    await supabase.auth.signOut();
    logOut();
    alert("로그아웃되었습니다");
  };

  //예산에 따른 견적추천 (홈페이지로 바뀔 거)
  const handleClickPartListButton = () => {
    router.push("/my/partlist");
  };
  //모달 페이지를 위한 함수
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {theme.toLowerCase() === "dark" ? (
        <header className="sticky top-0 h-[100px] border-b-[3px] border-b-gray-400 shadow-md shadow-black bg-[#0d1117] flex items-center px-16 z-10 shrink-0">
          <Link
            className="main-text text-white text-[40px] font-extrabold text-center font-serif"
            href="/"
          >
            PC Magician
          </Link>
          <nav className="ml-5">
            <ul>
              <li className="text-[18px] ml-[70px] text-white">
                <button onClick={handleClickPartListButton}>
                  Today's Part Prices
                </button>
              </li>
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-x-4">
            {/* -------------------------------------------------------------------------------------------------------------- */}
            {isInitalizedAuth ? (
              isLoggedIn ? (
                <ul>
                  <li className="text-[18px] font-medium text-white">
                    <Link href={"/my/SavedBuild"}>
                      <button className="mr-8">My Saved Builds</button>
                    </Link>
                    <button
                      className="border text-black font-serif font-bold text-[20px] border-b-white bg-white rounded-3xl p-2 px-3 "
                      onClick={handleClickLogOutButton}
                    >
                      log-out
                    </button>
                  </li>
                </ul>
              ) : (
                <>
                  <nav className="ml-5">
                    {/* 모달 페이지 */}
                    <ul>
                      <li className="border text-black font-serif font-bold text-[20px] border-b-white bg-white rounded-3xl p-2 px-3">
                        <button onClick={() => setIsModalOpen(true)}>
                          log-in
                        </button>
                        <Modal
                          open={isModalOpen}
                          onClose={() => setIsModalOpen(false)}
                        >
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
                    {/* 모달 페이지 끝 */}
                  </nav>
                  <nav className="ml-5">
                    <ul>
                      <li className="border text-black font-serif font-bold text-[20px] border-b-white bg-white rounded-3xl p-2 px-3">
                        <Link href={"/auth/sign_up"}>sign-up</Link>
                      </li>
                    </ul>
                  </nav>
                  <button
                    onClick={toggleTheme}
                    className="bg-white w-10 h-10 rounded-full flex justify-center items-center p-[1px]"
                  >
                    <FontAwesomeIcon
                      className="bg-black w-9 h-9 rounded-full text-3xl text-white"
                      icon={faSun}
                    />
                  </button>
                </>
              )
            ) : null}
            {/* -------------------------------------------------------------------------------------------------------------- */}
          </div>
        </header>
      ) : (
        <header className="sticky top-0 h-[100px] border-b-[3px] border-b-gray-300 shadow-md shadow-gray-200 bg-white flex items-center px-16 z-10 shrink-0">
          <Link
            className="main-text text-black text-[40px] font-extrabold text-center font-serif"
            href="/"
          >
            PC Magician
          </Link>
          <nav className="ml-5">
            <ul>
              <li className="text-[18px] ml-[70px] text-gray-700">
                <button onClick={handleClickPartListButton}>
                  Today's Part Prices
                </button>
              </li>
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-x-4">
            {/* -------------------------------------------------------------------------------------------------------------- */}
            {isInitalizedAuth ? (
              isLoggedIn ? (
                <ul>
                  <li className="text-[18px] font-medium text-gray-700">
                    <Link href={"/my/SavedBuild"}>
                      <button className="mr-8">My Saved Builds</button>
                    </Link>
                    <button
                      className="border text-white font-serif font-bold text-[20px] border-b-gray-300 bg-gray-700 rounded-3xl p-2 px-3"
                      onClick={handleClickLogOutButton}
                    >
                      log-out
                    </button>
                  </li>
                </ul>
              ) : (
                <>
                  <nav className="ml-5">
                    {/* 모달 페이지 */}
                    <ul>
                      <li className="border text-white font-serif font-bold text-[20px] border-b-gray-300 bg-gray-700 rounded-3xl p-2 px-3">
                        <button onClick={() => setIsModalOpen(true)}>
                          log-in
                        </button>
                        <Modal
                          open={isModalOpen}
                          onClose={() => setIsModalOpen(false)}
                        >
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
                    {/* 모달 페이지 끝 */}
                  </nav>
                  <nav className="ml-5">
                    <ul>
                      <li className="border text-white font-serif font-bold text-[20px] border-b-gray-300 bg-gray-700 rounded-3xl p-2 px-3">
                        <Link href={"/auth/sign_up"}>sign-up</Link>
                      </li>
                    </ul>
                  </nav>
                  <button
                    onClick={() => toggleTheme()}
                    className="bg-black w-10 h-10 rounded-full flex justify-center items-center p-[1px]"
                  >
                    <FontAwesomeIcon
                      className="bg-white w-9 h-9 rounded-full text-4xl"
                      icon={faMoon}
                    />
                  </button>
                </>
              )
            ) : null}
            {/* -------------------------------------------------------------------------------------------------------------- */}
          </div>
        </header>
      )}
    </>
  );
}

export default Header;
