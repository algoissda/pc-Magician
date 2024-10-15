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

  const handleClickMyCartButton = () => {
    if (!isLoggedIn) {
      router.push("/");
      setIsModalOpen(true);
    } else {
      router.push("/my/cart");
    }
  };

  const handleClickEstimateButton = () => {
    if (!isLoggedIn) {
      router.push("/");
      setIsModalOpen(true);
    } else {
      router.push("/my/estimate");
    }
  }
  const handleClickBudgetButton = () => {
    if (!isLoggedIn) {
      router.push("/");
      setIsModalOpen(true);
    } else {
      router.push("/my/Budget");
    }
  }

  //모달 페이지를 위한 함수
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header className="bg-gray-800 sticky top-0 h-16 border-b-slate-950 border-b flex items-center px-16 z-10 shrink-0">
      <Link className="text-white text-xl font-extrabold text-center" href="/">
        CustomPC
      </Link>
      <nav className="ml-20">
        <ul>
          <li className="text-[15px] font-medium text-white">
            <button onClick={handleClickEstimateButton}>내 견적</button>
          </li>
        </ul>
      </nav>
      <nav className="ml-5">
        <ul>
          <li className="text-[15px] font-medium text-white">
            <Link href="">임시(가격대별 견적 추천)</Link>
          </li>
        </ul>
      </nav>
      <nav className="ml-5">
        <ul>
          <li className="text-[15px] font-medium text-white">
            <button onClick={handleClickBudgetButton}>예산에 따른 견적추천</button>
          </li>
        </ul>
      </nav>
      <input
        type="search"
        placeholder="검색어를 입력해주세요"
        className="inline-block ml-auto border border-gray-600 rounded-xl w-[550px] px-4 h-8 bg-white"
      />
      <div className="ml-auto flex items-center gap-x-4">
        {/* -------------------------------------------------------------------------------------------------------------- */}
        {isInitalizedAuth ? (
          isLoggedIn ? (
            <ul>
              <li className="text-[15px] font-medium text-white">
                <button onClick={handleClickLogOutButton}>로그아웃</button>
              </li>
            </ul>
          ) : (
            <>
              <nav className="ml-5">
                <ul>
                  <li className="text-[15px] font-medium text-white">
                    <Link href={"/auth/sign_up"}>회원가입</Link>
                  </li>
                </ul>
              </nav>
              <nav className="ml-5">
                {/* 모달 페이지 */}
                <ul>
                  <li className="text-[15px] font-medium text-white">
                    <button onClick={() => setIsModalOpen(true)}>로그인</button>
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
        <button onClick={handleClickMyCartButton}>
          <img
            src="https://www.citypng.com/public/uploads/preview/hd-shopping-cart-white-logo-icon-transparent-png-701751694973936amdcratijm.png"
            alt=""
            className="w-[30px] ml-5"
          />
        </button>
      </div>
    </header>
  );
}

export default Header;
