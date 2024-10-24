import Link from "next/link";
import Modal from "../../modal/Loginmodal";

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
        <Link href="/my/saved-build">
          <button
            className={`mr-8 font-serif font-semibold text-${
              theme === "dark" ? "white" : "black"
            }`}
          >
            My Saved Builds
          </button>
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
              <div className="flex items-center justify-between">
                <p className={` ${
                theme === "dark" ? " text-white" : " text-[#0d1117] "
              }`}>
                  아이디가 없으신가요? &emsp;
                </p>
                <Link
                  href="/auth/sign_up"
                  className="text-blue-500"
                  onClick={() => setIsModalOpen(false)}
                >
                  회원가입 하러 가기
                </Link>
              </div>
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
