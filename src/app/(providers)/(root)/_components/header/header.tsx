import Link from "next/link";
import React from "react";

function Header() {
  return (
    <main>
      <div className="h-[30px] box-border border-b border-b-slate-950">
        <ul className="m-[6px] items-center flex justify-end m-auto m-0 w-[1280px]">
          <li className="gap-x-4">
            <p>임시</p>
          </li>
        </ul>
      </div>
      <header className=" bg-white sticky top-0 h-16 border-b-slate-950 border-b flex items-center px-16 z-10 shrink-0">
        <Link className="text-xl font-extrabold text-center" href="/">
          CustomPC
        </Link>

        <nav className="ml-20">
          <ul>
            <li className="text-[15px] font-medium">
              <Link href="">임시</Link>
            </li>
          </ul>
        </nav>
        <nav className="ml-5">
          <ul>
            <li className="text-[15px] font-medium">
              <Link href="">임시</Link>
            </li>
          </ul>
        </nav>
        <nav className="ml-5">
          <ul>
            <li className="text-[15px] font-medium">
              <Link href="">임시</Link>
            </li>
          </ul>
        </nav>

        <input type="search" className="ml-[130px] border border-gray-600 rounded-xl w-72 h-8" placeholder="검색어를 입력해주세요" />


        <div className="ml-auto flex items-center gap-x-4">
          <nav className="ml-5">
            <ul>
              <li className="text-[15px] font-medium">
                <Link href={"/auth/sign_up"}>회원가입</Link>
              </li>
            </ul>
          </nav>
          <nav className="ml-5">
            <ul>
              <li className="text-[15px] font-medium">
                <Link href="">로그인</Link>
              </li>
            </ul>
          </nav>
          <img
            src="https://static.coupangcdn.com/image/coupang/common/pc_header_img_sprite_new_gnb.svg#cart"
            alt=""
            className="w-[20px] ml-5"
          />
        </div>
      </header>
    </main>
  );
}

export default Header;
