import Link from "next/link";
import React from "react";

function Header() {
  return (
    <header className="bg-white sticky top-0 h-16 border-b-slate-950 border-b flex items-center px-72 z-10 shrink-0">
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

      <div className="ml-auto flex items-center gap-x-4">
        <Link href="/" className="font-semibold text-[15px]">
          로그아웃
        </Link>

        <div>
          <Link
            href="/auth/log_in"
            className="text-[15px] mr-4 text-gray-800 font-semibold"
          >
            로그인
          </Link>
          <Link
            href="/auth/sign_up"
            className="text-[15px] text-gray-800 font-semibold"
          >
            회원가입
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
