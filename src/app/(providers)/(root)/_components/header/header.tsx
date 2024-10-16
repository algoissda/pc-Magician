"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../../../../../supabase/client";
import { useAuthStore } from "../../../../../../zustand/auth.store";
import Modal from "../modal/modal"; //모달 페이지 가져오기

function Header() {
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
      router.push("/my/PartList");
  }
  //모달 페이지를 위한 함수
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header className="bg-gray-800 sticky top-0 h-16 border-b-slate-950 border-b flex items-center px-16 z-10 shrink-0">
      <Link className="text-white text-xl font-extrabold text-center" href="/">
        PC Magician
      </Link>
      <nav className="ml-5">
        <ul>
          <li className="text-[15px] font-medium text-white">
            <button onClick={handleClickPartListButton}>Today's Part Prices</button>
          </li>
        </ul>
      </nav>

      <div className="ml-auto flex items-center gap-x-4">
        {/* -------------------------------------------------------------------------------------------------------------- */}
        {isInitalizedAuth ? (
          isLoggedIn ? (
            <ul>
              <li className="text-[15px] font-medium text-white">
                <button className="mr-8">My Saved Builds</button>
                <button onClick={handleClickLogOutButton}>log-out</button>

              </li>
            </ul>
          ) : (
            <>
              <nav className="ml-5">
                <ul>
                  <li className="text-[15px] font-medium text-white">
                    <Link href={"/auth/sign_up"}>sign-up</Link>
                  </li>
                </ul>
              </nav>
              <nav className="ml-5">
                {/* 모달 페이지 */}
                <ul>
                  <li className="text-[15px] font-medium text-white">
                    <button onClick={() => setIsModalOpen(true)}>log-in</button>
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
            </>
          )
        ) : null}
        {/* -------------------------------------------------------------------------------------------------------------- */}

      </div>
    </header>
  );
}

export default Header;
