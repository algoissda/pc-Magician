import Link from "next/link";
import Modal from "../../modal/modal";

export const AuthButtons = ({
  isLoggedIn,
  handleLogOut,
  isModalOpen,
  setIsModalOpen,
  theme, // 기본값 설정
}: any) => {
  // theme 값 확인용 로그
  console.log("Current theme in AuthButtons:", theme);

  const buttonClass =
    theme === "dark" ? "bg-white text-black" : "bg-black text-white";

  return isLoggedIn ? (
    <ul>
      <li className="text-[18px] font-medium">
        <Link href="/my/SavedBuild">
          <button className="mr-8">My Saved Builds</button>
        </Link>
        <button
          className={`border font-serif font-bold text-[20px] border-b-white ${buttonClass} rounded-3xl p-2 px-3`}
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
          <li
            className={`border font-serif font-bold text-[20px] border-b-white ${buttonClass} rounded-3xl p-2 px-3`}
          >
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
          <li
            className={`border font-serif font-bold text-[20px] border-b-white ${buttonClass} rounded-3xl p-2 px-3`}
          >
            <Link
              href="/auth/sign_up"
              className={`text-${theme === "dark" ? "black" : "white"}`}
            >
              sign-up
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};
