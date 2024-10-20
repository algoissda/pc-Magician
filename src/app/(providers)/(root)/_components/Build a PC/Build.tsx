"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { ComponentProps, useState } from "react";
import { supabase } from "../../../../../../supabase/client";
import Product from "../../../../../../types/products.type";
import { useThemeStore } from "@/store/useStore";
import build from "next/dist/build";

type Part = {
  type: string;
  name: string;
  price: number;
};

function Build() {
  const theme = useThemeStore((state) => state.theme);
  const [budget, setBudget] = useState<string>("60"); // 예산
  const [selectCpuType, setCpuType] = useState<string>(""); // 선호 CPU
  const [selectVgaType, setVgaType] = useState<string>(""); // 선호 GPU
  const [build, setBuild] = useState<Part[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0); // 총합을 위한 상태 추가
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const partTypes: string[] = [
    "CPU",
    "VGA",
    "RAM",
    "MBoard",
    "SSD",
    "HDD",
    "Power",
    "Cooler",
    "Case",
  ];

  if (!googleApiKey) {
    throw new Error("환경 변수가 올바르게 설정되지 않았습니다.");
  }

  const handleChangeEstimateType: ComponentProps<"input">["onChange"] = (e) => {
    setBudget(e.target.value); // 숫자로 변환
  };

  const handleChangeCpuType: ComponentProps<"select">["onChange"] = (e) => {
    setCpuType(e.target.value);
  };

  const handleChangeGpuType: ComponentProps<"select">["onChange"] = (e) => {
    setVgaType(e.target.value);
  };

  // switchStates의 타입을 각 부품 이름을 키로 갖는 객체로 지정
  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>(
    partTypes.reduce((acc: Record<string, boolean>, partType: string) => {
      acc[partType] = true; // 각 부품은 초기 상태로 false를 가짐
      return acc;
    }, {})
  );

  // toggleSwitch 함수의 타입을 지정
  const toggleSwitch = (partType: string): void => {
    setSwitchStates((prev) => ({
      ...prev,
      [partType]: !prev[partType],
    }));
  };

  const initializeGoogleAI = (apiKey: string) => {
    try {
      // GoogleGenerativeAI 인스턴스 생성 및 API 키 설정
      const genAI = new GoogleGenerativeAI(apiKey);

      // gemini-1.5-flash 모델 가져오기
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      return model;
    } catch (error) {
      console.error("Failed to initialize Google AI:", error);
      return null;
    }
  };

  const geminiModel = initializeGoogleAI(googleApiKey);

  const handleEstimate = async () => {
    try {
      geminiModel;

      // 스위치가 켜져 있는 부품만 필터링
      const types = Object.entries(switchStates)
        .filter(([partType, isEnabled]) => isEnabled)
        .map(([partType]) => partType);

      let productStrings = "";
      const limit = 150; // 각 type당 N개의 데이터만 가져오기

      console.log(types);
      await Promise.all(
        types.map(async (type) => {
          const { data: products, error } = await supabase
            .from<Product>("products")
            .select("product_name, price")
            .eq("type", type)
            .like(
              "purpose",
              Number(budget) < 80
                ? "%사무용%"
                : Number(budget) < 100
                ? "%저사양%"
                : Number(budget) < 155
                ? "%보급형%"
                : Number(budget) < 370
                ? "%고사양%"
                : "%하이엔드%"
            )
            .like(
              "explanation",
              type === "CPU" || type === "MBoard"
                ? selectCpuType === "Intel"
                  ? "%소켓1700%"
                  : selectCpuType === "AMD"
                  ? "%소켓AM5%"
                  : "%"
                : "%"
            )
            .like(
              "product_name",
              type === "VGA"
                ? selectVgaType === "NVIDIA"
                  ? Number(budget) < 550
                    ? "%지포스%"
                    : "%4090%"
                  : selectVgaType === "AMD"
                  ? "%라데온%"
                  : "%"
                : "%"
            )
            .range(0, limit - 1); // limit 개수만큼 가져오기

          if (error) throw new Error(error.message);

          if (products && products.length > 0) {
            const productString = products
              .map(
                (product) =>
                  `${type}:"${product.product_name}" ~ ${product.price}원`
              )
              .join("| ");
            productStrings += (productStrings ? "| " : "") + productString;
          }
        })
      );

      const genAI = new GoogleGenerativeAI(googleApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `제공 부품 양식:(부품타입:"부품이름" ~ 가격) | 부품 : {${productStrings}} 이 부품을 이용하여 현재 예산${
        Number(budget) - 2
      }0000원 이내의 조립pc견적을 작성하시오.
    출력하는 각 부품의 이름과 가격은 제공된 부품의 이름과 가격이 동일해야 한다.
    모든 부품의 가격 합계는 예산보다 작아야 한다.
    제공되지 않은 부품의 경우 부품 이름을 공백으로 처리하고, 가격을 0으로 한다.
    출력 양식은 아래와 같이 한다.
    "CPU ~ 부품이름 ~ 가격|VGA ~ 부품이름 ~ 가격|RAM ~ 부품이름 ~ 가격|MBoard ~ 부품이름 ~ 가격|SSD ~ 부품이름 ~ 가격|HDD ~ 부품이름 ~ 가격|Power ~ 부품이름 ~ 가격|Cooler ~ 부품이름 ~ 가격 |Case ~ 부품이름 ~ 가격" 각 부품의 이름과 가격을 출력하고, 구분은 '|'로 한다.
    HDD는 꼭 출력한다.
    그 이외의 내용은 출력하지 않는다.`;
      console.log(prompt);

      const result2 = await model.generateContent(prompt);
      console.log(result2.response.text());
      setBuild(parseParts(result2.response.text()));
    } catch (error) {
      console.error("Error:", error);
      setBuild([]);
    }
  };

  // 부품을 파싱하고 가격 계산
  const parseParts = (input: string): Part[] => {
    const parsedParts = input.split("|").map((item) => {
      const [type, name = "", priceString = ""] = item.split("~");
      const price = priceString.trim()
        ? parseInt(priceString.trim().replace(/[^0-9]/g, ""), 10)
        : 0;
      return { type: type.trim(), name: name.trim(), price };
    });

    // 총합 계산
    const total = parsedParts.reduce((acc, part) => acc + part.price, 0);
    setTotalPrice(total); // 총합 설정
    return parsedParts;
  };

  return (
    <>
      {theme.toLowerCase() === "dark" ? (
        <div>
          <main className="bg-gradient-to-r from-sky-500 to-slate-300 bg-[180deg] p-[1px] rounded-[40px] mt-8 mx-4 sm:mx-12 lg:mx-20 h-[66vh]">
            <section className="flex flex-col lg:flex-row bg-[#0d1117] rounded-[40px] w-full h-full">
              <article className="w-full lg:w-1/2 mr-0 lg:mr-4 p-4">
                <section className="p-[1px] rounded-[40px] bg-gradient-to-r from-sky-500 to-slate-300 bg-[180deg] h-full">
                  <section className="bg-[#0d1117] rounded-[40px] px-2 h-full">
                    <ul className="text-gray-300 h-full flex flex-col justify-between">
                      {partTypes.map((partType, index) => (
                        <li
                          key={partType}
                          className="relative text-lg flex flex-row py-3 pt-2 h-full items-center"
                        >
                          {/* 스위치 버튼 */}
                          <button
                            onClick={() => toggleSwitch(partType)}
                            className={`w-8 h-8 ml-2 mr-2 ${
                              switchStates[partType]
                                ? "bg-green-500 rounded-full"
                                : "bg-gray-700 rounded-full"
                            }`}
                          ></button>

                          <div className="flex flex-col w-full pr-5">
                            <div className="w-full flex flex-grow justify-between items-center">
                              <span className="text-white pb-[2px]">
                                {partType}
                              </span>
                              <span className="text-white pb-[2px] text-sm">
                                {build.find((part) => part.type === partType)
                                  ?.price
                                  ? `${build
                                      .find((part) => part.type === partType)
                                      ?.price.toLocaleString()} 원`
                                  : "N/A"}
                              </span>
                            </div>

                            <span className="text-gray-200 text-xs pl-1">
                              {build.find((part) => part.type === partType)
                                ?.name || "N/A"}
                            </span>
                          </div>

                          {/* 그라데이션 줄 (마지막 항목 제외) */}
                          {index !== partTypes.length - 1 && (
                            <span
                              className="absolute bottom-0 left-0 w-full h-[1px]"
                              style={{
                                background:
                                  "linear-gradient(to right, #0ea5e9, #3730a3, #c026d3, #e11d48)",
                              }}
                              aria-hidden="true"
                            ></span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                </section>
              </article>
              <aside className="w-full lg:w-1/2">
                {/* 상단에 아이콘 추가 */}
                <div className="absolute top-0 right-0 p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="url(#gradient)"
                    className="w-10 h-10 text-purple-400"
                  >
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#00dbde" />
                        <stop offset="100%" stopColor="#fc00ff" />
                      </linearGradient>
                    </defs>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12a7.5 7.5 0 1115 0M12 14.25V12M12 9.75h.008v.008H12V9.75z"
                    />
                  </svg>
                </div>
                <section className="p-10 h-full flex flex-col">
                  <div className=" flex flex-wrap h-1/2 mt-7 justify-center">
                    {/* 예산 입력 필드 */}
                    <div className="mb-4 flex items-center w-full">
                      <label
                        htmlFor="estimateType"
                        className="text-purple-400 text-xl whitespace-nowrap"
                      >
                        예산:
                      </label>
                      <div className="flex items-center w-full">
                        <input
                          id="estimateType"
                          value={budget}
                          onChange={handleChangeEstimateType}
                          type="number"
                          className="w-full p-2 border border-purple-400 bg-transparent text-white rounded mr-2"
                          placeholder="예산 입력"
                        />
                        <span className="text-purple-400 text-lg block w-8 whitespace-nowrap">
                          만원
                        </span>
                      </div>
                    </div>

                    {/* CPU 선호 선택 */}
                    <div className="mb-4  w-full">
                      <label
                        htmlFor="cpuType"
                        className="text-purple-400 text-xl"
                      >
                        CPU 선호
                      </label>
                      <select
                        id="cpuType"
                        value={selectCpuType}
                        onChange={handleChangeCpuType}
                        className="w-full p-2 border border-purple-400 bg-transparent text-white rounded"
                      >
                        <option value="">선호하는 CPU를 선택하세요</option>
                        <option value="Intel">Intel</option>
                        <option value="AMD">AMD</option>
                      </select>
                    </div>

                    {/* GPU 선호 선택 */}
                    <div className="mb-4  w-full">
                      <label
                        htmlFor="gpuType"
                        className="text-purple-400 text-xl"
                      >
                        GPU 선호
                      </label>
                      <select
                        id="gpuType"
                        value={selectVgaType}
                        onChange={handleChangeGpuType}
                        className="w-full p-2 border border-purple-400 bg-transparent text-white rounded"
                      >
                        <option value="">선호하는 GPU를 선택하세요</option>
                        <option value="NVIDIA">NVIDIA</option>
                        <option value="AMD">AMD</option>
                      </select>
                    </div>
                    {/* 설명 */}
                    <div className="w-full text-base text-left text-white">
                      asdfasdf
                    </div>
                  </div>
                  {/* 가격 표시 */}
                  <div className="mt-auto text-white text-4xl text-left">
                    {"최적가 : "}
                    {totalPrice
                      ? `${totalPrice.toLocaleString()} 원`
                      : "XXX,XXX,XXX 원"}
                  </div>
                </section>
              </aside>
            </section>
          </main>
          <footer className="mt-6 flex justify-center">
            <button
              onClick={handleEstimate}
              className="px-10 py-3 bg-gradient-to-r from-green-400 to-purple-500 text-white text-xl rounded-full hover:bg-gradient-to-r hover:from-green-300 hover:to-purple-400"
            >
              SAVE
            </button>
          </footer>
        </div>
      ) : (
        <div>
          <main className="bg-gradient-to-r from-purple-700 via-purple-950 to-black bg-[180deg] p-[1px] rounded-[40px] mt-8 mx-4 sm:mx-12 lg:mx-20 h-[66vh]">
            <section className="flex flex-col lg:flex-row bg-white rounded-[40px] w-full h-full">
              <article className="w-full lg:w-1/2 mr-0 lg:mr-4 p-4">
                <section className="p-[1px] rounded-[40px] bg-gradient-to-r from-purple-700 via-purple-950 to-black bg-[180deg] h-full">
                  <section className="bg-white rounded-[40px] px-2 h-full">
                    <ul className="text-gray-700 h-full flex flex-col justify-between">
                      {partTypes.map((partType, index) => (
                        <li
                          key={partType}
                          className="relative text-lg flex flex-row py-3 pt-2 h-full items-center"
                        >
                          {/* 스위치 버튼 */}
                          <button
                            onClick={() => toggleSwitch(partType)}
                            className={`w-8 h-8 ml-2 mr-2 ${
                              switchStates[partType]
                                ? "bg-green-500 rounded-full"
                                : "bg-gray-300 rounded-full"
                            }`}
                          ></button>

                          <div className="flex flex-col w-full pr-5">
                            <div className="w-full flex flex-grow justify-between items-center">
                              <span className="text-gray-700 pb-[2px]">
                                {partType}
                              </span>
                              <span className="text-gray-700 pb-[2px] text-sm">
                                {build.find((part) => part.type === partType)
                                  ?.price
                                  ? `${build
                                      .find((part) => part.type === partType)
                                      ?.price.toLocaleString()} 원`
                                  : "N/A"}
                              </span>
                            </div>

                            <span className="text-gray-500 text-xs pl-1">
                              {build.find((part) => part.type === partType)
                                ?.name || "N/A"}
                            </span>
                          </div>

                          {/* 그라데이션 줄 (마지막 항목 제외) */}
                          {index !== partTypes.length - 1 && (
                            <span
                              className="absolute bottom-0 left-0 w-full h-[1px]"
                              style={{
                                background:
                                  "linear-gradient(to right, #a855f7 , #6b21a8 , #3b0764 , #000000 )",
                              }}
                              aria-hidden="true"
                            ></span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                </section>
              </article>
              <aside className="w-full lg:w-1/2">
                {/* 상단에 아이콘 추가 */}
                <div className="absolute top-0 right-0 p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="url(#gradient)"
                    className="w-10 h-10 text-black"
                  >
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#00dbde" />
                        <stop offset="100%" stopColor="#fc00ff" />
                      </linearGradient>
                    </defs>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12a7.5 7.5 0 1115 0M12 14.25V12M12 9.75h.008v.008H12V9.75z"
                    />
                  </svg>
                </div>
                <section className="p-10 h-full flex flex-col">
                  <div className="flex flex-wrap h-1/2 mt-7 justify-center">
                    {/* 예산 입력 필드 */}
                    <div className="mb-4 flex items-center w-full">
                      <label
                        htmlFor="estimateType"
                        className="text-black text-xl whitespace-nowrap"
                      >
                        예산:
                      </label>
                      <div className="flex items-center w-full">
                        <input
                          id="estimateType"
                          value={budget}
                          onChange={handleChangeEstimateType}
                          type="number"
                          className="w-full p-2 border border-gray-400 bg-transparent text-black rounded mr-2"
                          placeholder="예산 입력"
                        />
                        <span className="text-black text-lg block w-8 whitespace-nowrap">
                          만원
                        </span>
                      </div>
                    </div>

                    {/* CPU 선호 선택 */}
                    <div className="mb-4 w-full">
                      <label htmlFor="cpuType" className="text-black text-xl">
                        CPU 선호
                      </label>
                      <select
                        id="cpuType"
                        value={selectCpuType}
                        onChange={handleChangeCpuType}
                        className="w-full p-2 border border-gray-400 bg-transparent text-black rounded"
                      >
                        <option value="">선호하는 CPU를 선택하세요</option>
                        <option value="Intel">Intel</option>
                        <option value="AMD">AMD</option>
                      </select>
                    </div>

                    {/* GPU 선호 선택 */}
                    <div className="mb-4 w-full">
                      <label htmlFor="gpuType" className="text-black text-xl">
                        GPU 선호
                      </label>
                      <select
                        id="gpuType"
                        value={selectVgaType}
                        onChange={handleChangeGpuType}
                        className="w-full p-2 border border-gray-400 bg-transparent text-black rounded"
                      >
                        <option value="">선호하는 GPU를 선택하세요</option>
                        <option value="NVIDIA">NVIDIA</option>
                        <option value="AMD">AMD</option>
                      </select>
                    </div>
                    {/* 설명 */}
                    <div className="w-full text-base text-left text-black">
                      asdfasdf
                    </div>
                  </div>
                  {/* 가격 표시 */}
                  <div className="mt-auto text-gray-700 text-4xl text-left">
                    {"최적가 : "}
                    {totalPrice
                      ? `${totalPrice.toLocaleString()} 원`
                      : "XXX,XXX,XXX 원"}
                  </div>
                </section>
              </aside>
            </section>
          </main>
          <footer className="mt-6 flex justify-center">
            <button
              onClick={handleEstimate}
              className="px-10 py-3 bg-gradient-to-r from-green-400 to-purple-500 text-white text-xl rounded-full hover:bg-gradient-to-r hover:from-green-300 hover:to-purple-400"
            >
              SAVE
            </button>
          </footer>
        </div>
      )}
    </>
  );
}

export default Build;
