import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import ReactDOM from "react-dom";
import { supabase } from "../../../../../../supabase/client";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}
//모달 페이지임!!

const Modal = ({ open, onClose, children }: ModalProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleClickLogInButton = async () => {
    if (!email) return alert("이메일을 입력해주세요.");
    if (!email.includes("@") && !email.includes("."))
      return alert("이메일 양식이 맞지 않습니다.");
    if (!password) return alert("비밀번호를 입력해주세요.");
    if (password.length < 8)
      return alert("비밀번호를 8글자 이상 입력해주세요.");

    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (response.error) {
      alert("로그인에 실패했습니다, 올바른 정보인지 확인해주세요.");
    } else {
      alert("로그인에 성공했습니다,홈페이지로 이동합니다.");
      onClose();
    }

    router.push("/");
  };

  if (!open) return null;

  const handleClickModalOutSide = () => {
    onClose();
  }
  const handleClickModalBody = (e : React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }

  return ReactDOM.createPortal(

    <>
      <div onClick={handleClickModalOutSide} className="bg-black/50 flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-20">
        {/* 모달 바깥쪽을 클릭시 닫히는거 구현할 예정 */}
        <div onClick={handleClickModalBody} className="modal_body bg-white rounded-md w-full max-w-[400px] px-5 py-8">
          <h2 className="font-bold text-3xl text-center my-12">로그인</h2>
          <section className="flex flex-col items-center gap-y-4 max-w-sm mx-auto w-full">
            <div className="grid gap-y-1.5 w-full">
              <label
                htmlFor="asd"
                className="text-sm font-medium text-gray-800"
              >
                이메일
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="block border w-full px-6 py-3 rounded focus:border-black outline:none transition"
              />
            </div>
            <div className="grid gap-y-1.5 w-full">
              <label
                htmlFor="asd"
                className="text-sm font-medium text-gray-800"
              >
                비밀번호
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="block border w-full px-6 py-3 rounded focus:border-black outline:none transition"
              />
            </div>
            <div className="mt-2"></div>
            <button
              onClick={handleClickLogInButton}
              className="border-slate-700 py-4 px-12 text-[15px] w-full font-semibold bg-black text-white"
            >
              로그인하기
            </button>
            <button onClick={onClose}>모달 닫기</button>
            {children}
          </section>
        </div>
      </div>
    </>,
    document.getElementById("global-modal") as HTMLElement
  );
};

export default Modal;
