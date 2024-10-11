import React from "react";

function LogInPage() {
  return (
    <template>
      <div className="bg-black/50 flex items-center justify-center fixed top-0 left-0 right-0 bottom-0 z-20">
        <div className="modal_body bg-white rounded-md w-full max-w-[400px] px-5 py-8">
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
                type="password"
                className="block border w-full px-6 py-3 rounded focus:border-black outline:none transition"
              />
            </div>
            <div className="mt-2"></div>
            <button className="border-slate-700 py-4 px-12 text-[15px] w-full font-semibold bg-black text-white">
              로그인하기
            </button>
          </section>
        </div>
      </div>
    </template>
  );
}

export default LogInPage;
