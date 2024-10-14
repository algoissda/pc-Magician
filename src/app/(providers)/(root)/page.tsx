/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React from "react";

function MainPage() {
  return (
    <main className=" px-5 lg:px-8 flex flex-col grow w-full items-stretch py-6 lg:py-10 max-w-screen-lg mx-auto">
      <h2 className="font-bold text-3xl text-center my-1 text-pink-200">
        추천 부품들 - 전체 카테고리
      </h2>
      <ul className="mt-20 grid grid-cols-4 gap-x-8 gap-y-32">
        <Link
          href={"/product"}
          className="text-white transition ease-in-out hover:scale-110 hover:bg-red-500 hover:border-slate-50 rounded-lg hover:text-black hover:font-bold"
        >
          그래픽카드
          <img
            src="https://static.gigabyte.com/StaticFile/Image/Global/ef510bf594c2f68685ca325beb694287/Product/15431/Png"
            alt=""
          />
          <p>
            {" "}
            GeForce® GTX 1060 Integrated with 6GB GDDR5 192bit memory WINDFORCE
            2X with Blade Fan Design
          </p>
          <br />
          <p className="font-bold">PRICE : 999$</p>
        </Link>
        <Link
          href={"/product"}
          className="text-white transition ease-in-out hover:scale-110 hover:bg-red-500 hover:border-slate-50 rounded-lg hover:text-black hover:font-bold"
        >
          그래픽카드
          <img
            src="https://static.gigabyte.com/StaticFile/Image/Global/ef510bf594c2f68685ca325beb694287/Product/15431/Png"
            alt=""
          />
          <p>
            {" "}
            GeForce® GTX 1060 Integrated with 6GB GDDR5 192bit memory WINDFORCE
            2X with Blade Fan Design
          </p>
          <br />
          <p className="font-bold">PRICE : 999$</p>
        </Link>
        <Link
          href={"/product"}
          className="text-white transition ease-in-out hover:scale-110 hover:bg-red-500 hover:border-slate-50 rounded-lg hover:text-black hover:font-bold"
        >
          그래픽카드
          <img
            src="https://static.gigabyte.com/StaticFile/Image/Global/ef510bf594c2f68685ca325beb694287/Product/15431/Png"
            alt=""
          />
          <p>
            {" "}
            GeForce® GTX 1060 Integrated with 6GB GDDR5 192bit memory WINDFORCE
            2X with Blade Fan Design
          </p>
          <br />
          <p className="font-bold">PRICE : 999$</p>
        </Link>
        <Link
          href={"/product"}
          className="text-white transition ease-in-out hover:scale-110 hover:bg-red-500 hover:border-slate-50 rounded-lg hover:text-black hover:font-bold"
        >
          그래픽카드
          <img
            src="https://static.gigabyte.com/StaticFile/Image/Global/ef510bf594c2f68685ca325beb694287/Product/15431/Png"
            alt=""
          />
          <p>
            {" "}
            GeForce® GTX 1060 Integrated with 6GB GDDR5 192bit memory WINDFORCE
            2X with Blade Fan Design
          </p>
          <br />
          <p className="font-bold">PRICE : 999$</p>
        </Link>
        <Link
          href={"/product"}
          className="text-white transition ease-in-out hover:scale-110 hover:bg-red-500 hover:border-slate-50 rounded-lg hover:text-black hover:font-bold"
        >
          그래픽카드
          <img
            src="https://static.gigabyte.com/StaticFile/Image/Global/ef510bf594c2f68685ca325beb694287/Product/15431/Png"
            alt=""
          />
          <p>
            {" "}
            GeForce® GTX 1060 Integrated with 6GB GDDR5 192bit memory WINDFORCE
            2X with Blade Fan Design
          </p>
          <br />
          <p className="font-bold">PRICE : 999$</p>
        </Link>
        <Link
          href={"/product"}
          className="text-white transition ease-in-out hover:scale-110 hover:bg-red-500 hover:border-slate-50 rounded-lg hover:text-black hover:font-bold"
        >
          그래픽카드
          <img
            src="https://static.gigabyte.com/StaticFile/Image/Global/ef510bf594c2f68685ca325beb694287/Product/15431/Png"
            alt=""
          />
          <p>
            {" "}
            GeForce® GTX 1060 Integrated with 6GB GDDR5 192bit memory WINDFORCE
            2X with Blade Fan Design
          </p>
          <br />
          <p className="font-bold">PRICE : 999$</p>
        </Link>
        <Link
          href={"/product"}
          className="text-white transition ease-in-out hover:scale-110 hover:bg-red-500 hover:border-slate-50 rounded-lg hover:text-black hover:font-bold"
        >
          그래픽카드
          <img
            src="https://static.gigabyte.com/StaticFile/Image/Global/ef510bf594c2f68685ca325beb694287/Product/15431/Png"
            alt=""
          />
          <p>
            {" "}
            GeForce® GTX 1060 Integrated with 6GB GDDR5 192bit memory WINDFORCE
            2X with Blade Fan Design
          </p>
          <br />
          <p className="font-bold">PRICE : 999$</p>
        </Link>
        <Link
          href={"/product"}
          className="text-white transition ease-in-out hover:scale-110 hover:bg-red-500 hover:border-slate-50 rounded-lg hover:text-black hover:font-bold"
        >
          그래픽카드
          <img
            src="https://static.gigabyte.com/StaticFile/Image/Global/ef510bf594c2f68685ca325beb694287/Product/15431/Png"
            alt=""
          />
          <p>
            {" "}
            GeForce® GTX 1060 Integrated with 6GB GDDR5 192bit memory WINDFORCE
            2X with Blade Fan Design
          </p>
          <br />
          <p className="font-bold">PRICE : 999$</p>
        </Link>
      </ul>
    </main>
  );
}

export default MainPage;
