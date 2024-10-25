import { useThemeStore } from "@/store/useStore";

function QuestionAndAnswer() {
  const theme = useThemeStore((state) => state.theme);
  return (
    <main className="flex flex-col items-center justify-center h-full w-full">
      <h2
        className={`text-6xl  ml-[28rem] mt-16 font-serif ${
          theme === "dark" ? "  text-gray-300" : "  text-gray-800 "
        }`}
      >
        Notice Board
      </h2>
      <section className="w-full mt-10 ml-[26rem]">
        <article className="flex-grow">
          <section className="bg-black bg-opacity-20 min-h-[500px]  ">
            <div
              className={`flex justify-between p-2 border-b font-bold  ${
                theme === "dark"
                  ? "  border-white text-white"
                  : "  border-[#0d1117] text-[#0d1117] "
              } `}
            >
              <span
                className={`border-r pr-9 ${
                  theme === "dark" ? "  border-white" : "  border-[#0d1117] "
                } `}
              >
                No.
              </span>
              <span className="w-1/2 pl-[212px] absolute ">Title</span>
              <span className="ml-[175px]">작성 날짜</span>
              <span>Action</span>
            </div>
            {/* <div
            className={`flex justify-between p-2 border-b   ${
              theme === "dark"
                ? "  border-white text-white"
                : "  border-[#0d1117] text-[#0d1117] opacity-70 "
            }  `}
          >
            <span>1</span>
            <span>제목1</span>
            <span>작성 날짜1</span>
            <span
              className={` px-3 py-1 rounded ${
                theme === "dark"
                  ? "  border-white text-white"
                  : "  border-[#0d1117] text-[#0d1117] opacity-70 "
              } `}
            >
              개추
            </span>
          </div> */}
            {/* 반복 돌릴 때 이 아래 부분은 지우고, 위에 부분만 반복 시키면 됨 */}
            <div
              className={`flex justify-between p-2 border-b  ${
                theme === "dark"
                  ? "  border-white text-white"
                  : "  border-[#0d1117] text-[#0d1117] opacity-70 "
              }  `}
            >
              <span>2</span>
              <span className="mx-1">제목2</span>
              <span className="">작성 날짜2</span>
              <span
                className={` px-3 py-1 rounded ${
                  theme === "dark"
                    ? "  border-white text-white"
                    : "  border-[#0d1117] text-[#0d1117] opacity-70 "
                } `}
              >
                개추
              </span>
            </div>
          </section>
        </article>
      </section>
      <div className="flex justify-between items-center w-[80%] ml-80 pl-60">
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-gray-200 rounded-lg">{"<"}</button>
          <span className="w-3 flex justify-center items-center"></span>
          <button className="px-4 py-2 bg-gray-200 rounded-lg">{">"}</button>
        </div>

        <button className="bg-white font-bold text-black rounded-lg px-6 py-3 ml-au w-[70%]">
          글 작성하기
        </button>
      </div>
    </main>
  );
}

export default QuestionAndAnswer;
