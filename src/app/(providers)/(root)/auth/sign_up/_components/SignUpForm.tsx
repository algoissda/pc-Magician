"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../../../../../../supabase/client";

function SignUpForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleClickSignUpButton = async () => {
    if (!email) return alert("이메일을 입력해주세요.");
    if (!email.includes("@") && !email.includes("."))
      return alert("이메일 양식이 맞지 않습니다.");
    if (!password) return alert("비밀번호를 입력해주세요.");
    if (password.length < 8)
      return alert("비밀번호를 8글자 이상 입력해주세요.");
    if (password !== passwordConfirm)
      return alert("비밀번호와 비밀번호 확인이 맞지 않습니다.");

    const response = await supabase.auth.signUp({
      email,
      password,
    });

    if (!response) {
      alert("회원가입에 실패했습니다.");
    } else {
      alert("회원가입에 성공했습니다,홈페이지로 이동합니다.");
    }

    router.push("/");
  };
  return (
    <main className="px-5 lg:px-8 pt-[6%] pb-[16%] flex flex-col grow w-full items-stretch mx-auto max-w-screen-lg text-white">
      <h2 className="text-3xl font-bold text-center my-16">회원가입</h2>
      <section className="flex flex-col items-center gap-y-4 max-w-sm mx-auto w-full h-full">
        <div className="grid gap-y-2 w-full">
          <label className="text-sm font-medium">이메일</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            id="email"
            className="block border w-full px-6 py-3 rounded outline-none transition text-black border-slate-300 focus:border-black"
          />
        </div>
        <div className="grid gap-y-2 w-full">
          <label className="text-sm font-medium">비밀번호</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            id="password"
            className="block border w-full px-6 py-3 rounded outline-none transition text-black border-slate-300 focus:border-black"
          />
        </div>
        <div className="grid gap-y-2 w-full">
          <label className="text-sm font-medium">비밀번호 확인</label>
          <input
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            type="password"
            id="passwordConfirm"
            className="block border w-full px-6 py-3 rounded outline-none transition text-black border-slate-300 focus:border-black"
          />
        </div>
        <div className="mt-2 w-full">
          <button
            onClick={handleClickSignUpButton}
            className="border py-4 px-3 border-slate-700 text-[15px] font-bold bg-sky-950 w-full"
          >
            회원가입하기
          </button>
        </div>
      </section>
    </main>
  );
}

export default SignUpForm;
