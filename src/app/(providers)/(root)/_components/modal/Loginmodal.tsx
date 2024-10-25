/* eslint-disable react-hooks/rules-of-hooks */
import { useThemeStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import ReactDOM from "react-dom";
import { supabase } from "../../../../../../supabase/client";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ open, onClose }: ModalProps) => {
  const theme = useThemeStore((state) => state.theme);

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleClickLogInButton = async () => {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (response.error) {
      alert("로그인에 실패했습니다, 올바른 정보인지 확인해주세요.");
    } else {
      alert("로그인에 성공했습니다, 홈페이지로 이동합니다.");
      onClose();
      router.push("/");
    }
  };

  if (!open) return null;

  const handleClickModalOutSide = () => {
    onClose();
  };

  const handleClickModalBody = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return alert("이메일을 입력해주세요.");
    if (!email.includes("@") || !email.includes("."))
      return alert("이메일 양식이 맞지 않습니다.");
    if (!password) return alert("비밀번호를 입력해주세요.");
    if (password.length < 8)
      return alert("비밀번호를 8글자 이상 입력해주세요.");

    handleClickLogInButton();
  };

  async function signInWithKakao() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
    });
  }

  const lineThemeStyle =
    theme === "dark"
      ? "linear-gradient(to right, #0ea5e9, #3730a3, #c026d3, #e11d48)"
      : "linear-gradient(to right, #a855f7 , #6b21a8 , #3b0764 , #000000)";

  return ReactDOM.createPortal(
    <>
      <div
        onClick={handleClickModalOutSide}
        className="bg-black/50 flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-20"
      >
        <div
          className="w-96 h-[650px] p-[2px] rounded-lg"
          style={{
            background: lineThemeStyle,
          }}
        >
          <div
            onClick={handleClickModalBody}
            className={`modal_body ${
              theme === "dark" ? "bg-[#0d1117]" : "bg-white"
            } rounded-md w-full px-5 py-8 h-full`}
          >
            <h2
              className={`font-bold text-3xl text-center my-12 ${
                theme === "dark" ? "text-white" : "text-[#0d1117]"
              } `}
            >
              Log-In
            </h2>

            <span
              className="w-[100%] h-[2px] opacity-100 block my-7"
              style={{
                background: lineThemeStyle,
              }}
            ></span>

            <button
              className="w-full h-11 bg-[#fee500] flex justify-center items-center px-5 rounded-md"
              onClick={signInWithKakao}
            >
              <img
                className="w-5 inset-0"
                src="https://cdn-icons-png.flaticon.com/512/2111/2111466.png"
              />
              <h3 className="mx-auto">Login with Kakao</h3>
            </button>

            <span
              className="w-[100%] h-[2px] opacity-100 block my-7"
              style={{
                background: lineThemeStyle,
              }}
            ></span>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center gap-y-4 mx-auto w-full"
            >
              <div className="grid gap-y-1.5 w-full">
                <label
                  htmlFor="email"
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-white" : "text-[#0d1117]"
                  } `}
                >
                  Email
                </label>
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className={`block border w-full px-6 py-3 rounded focus:border-black outline:none transition  ${
                    theme === "dark"
                      ? " bg-[#0d1117] text-white"
                      : " bg-white text-black "
                  }`}
                />
              </div>
              <div className="grid gap-y-1.5 w-full">
                <label
                  htmlFor="password"
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-white" : "text-[#0d1117]"
                  } `}
                >
                  Password
                </label>
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className={`block border w-full px-6 py-3 rounded focus:border-black outline:none transition  ${
                    theme === "dark"
                      ? " bg-[#0d1117] text-white"
                      : " bg-white text-black "
                  } `}
                />
              </div>
              <button
                type="submit"
                className={`border-slate-700 py-4 px-12 text-[15px] w-full font-semibold ${
                  theme === "dark"
                    ? " text-[#0d1117] bg-white"
                    : " text-white bg-[#0d1117] "
                } `}
              >
                Log in
              </button>
            </form>
          </div>
        </div>
      </div>
    </>,
    document.getElementById("global-modal") as HTMLElement
  );
};

export default Modal;
