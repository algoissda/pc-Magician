"use client";
import React, { useState } from "react";

function EstimatePage() {
  let [count, setCount] = useState(0);

  function incrementCount() {
    count = count + 1;
    setCount(count);
  }
  function decrementCount() {
    count = count - 1;
    setCount(count);
  }
  return (
    <main className="px-5 lg:px-8 flex flex-col grow w-full items-stretch py-6 lg:py-10 max-w-screen-2xl mx-auto text-white">
      <h1 className="font-extrabold text-2xl text-left mt-10">
        내 데스크탑 견적
      </h1>

      <ul className="">
        {/* 매핑할 부분 */}
        <li className="grid grid-cols-1 gap-y-5 font-semibold text-[15px]">
          <p className="mt-20">VGA - 그래픽카드</p>
          <div className="flex">
            <img
              className="w-[150px] flex"
              src="https://static.gigabyte.com/StaticFile/Image/Global/ef510bf594c2f68685ca325beb694287/Product/15431/Png"
              alt=""
            />
            <div className="text-red-100">
              GTX 1060
              <br />
              <p className="mb-5">
                GeForce® GTX 1060 Integrated with 6GB GDDR5 192bit memory
                WINDFORCE 2X with Blade Fan Design
              </p>
              <p>설명</p>
            </div>
          </div>
          {/* 수량&가격 코드 */}
          <div className="justify-end ml-[1400px]">
            <div className="text-xl">수량</div>
            <p className="text-red-500 text-xl">{count}</p>
            <div className="">
              <button className="text-2xl" onClick={decrementCount}>
                -
              </button>
              <button className="text-2xl" onClick={incrementCount}>
                +
              </button>
            </div>
          </div>
          {/* 수량 끝남 */}
        </li>
        {/* 매핑할 부분 끝남 */}
      </ul>
    </main>
  );
}

export default EstimatePage;
