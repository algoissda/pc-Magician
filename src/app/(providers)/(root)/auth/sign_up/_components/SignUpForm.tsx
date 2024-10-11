'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../../../../../../supabase/client";

function SignUpForm() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const handleClickSignUpButton = async() => {
        if(!email) return alert("이메일을 입력해주세요");
        if(!email.includes("@") && !email.includes(".")) return alert("이메일 양식이 맞지 않습니다");
        if(!password) return alert("비밀번호를 입력해주세요");
        if(password.length < 8) return alert("비밀번호를 8글자 이상 입력해주세요");
        if(password !== passwordConfirm) return alert("비밀번호와 비밀번호 확인이 맞지 않습니다");


        const response = await supabase.auth.signUp({
            email,
            password
        })

        if(!response){
            alert("회원가입에 실패했습니다");
        }else{
            alert("회원가입에 성공했습니다 홈페이지로 이동합니다")
        }

        router.push("/");

    }
    return (
        <main>
            <div className="flex flex-col items-center justify-center min-h-screen">

                <h2 className="font-bold mb-4 text-3xl">회원가입</h2>

                <label htmlFor="email" className="mb-2 ml-[-330px] text-gray-500">이메일</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" id="email" className="border border-black h-8 w-96" />

                <label htmlFor="password" className="mb-2 ml-[-320px] text-gray-500">비밀번호</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" id="password" className="border border-black h-8 w-96" />
                {/* {!password ? (
                <strong className="text-red-500">비밀번호를 입력해주세요</strong>
                ) : null} */}

                <label htmlFor="passwordConfirm" className="mb-2 ml-[-290px] text-gray-500">비밀번호 확인</label>
                <input value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} type="password" id="passwordConfirm" className="border border-black h-8 w-96" />
                {/* {!passwordConfirm ? (
                <strong className="text-red-500">비밀번호 확인을 입력해주세요</strong>
                ) : null} */}

                <button onClick={handleClickSignUpButton} className="h-14 w-96 bg-black text-white mt-10">회원가입하기</button>


            </div>
        </main>
    )
}

export default SignUpForm