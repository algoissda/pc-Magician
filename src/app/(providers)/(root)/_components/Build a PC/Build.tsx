"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { ComponentProps, useState } from "react";
import { supabase } from "../../../../../../supabase/client";
import Product from "../../../../../../types/products.type";
import { useThemeStore } from "@/store/useStore";
import build from "next/dist/build";
import { error } from "console";
import { type } from "os";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

// ...

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
  const [builded, setBuilded] = useState<boolean>(false);
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const partTypes: string[] = [
    "CPU",
    "Cooler",
    "MBoard",
    "RAM",
    "VGA",
    "SSD",
    "HDD",
    "Case",
    "Power",
  ];

  const safetySettings = [
    // Gemini API가 안전상의 문제로 날 차단한다. 그것을 방지
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
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
      console.error("Google AI 초기화 실패:", error);
      return null;
    }
  };

  const geminiModel = initializeGoogleAI(googleApiKey);

  const handleEstimate = async (
    limit: number = 250,
    feedback: number = 0,
    budgetIssues: number = 1,
    errorCount: number = 0,
    retryCount: number = 0 // 재시도 횟수 제한
  ) => {
    try {
      setBuilded(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      geminiModel;

      // 스위치가 켜져 있는 부품만 필터링
      const types = Object.entries(switchStates)
        .filter(([partType, isEnabled]) => isEnabled)
        .map(([partType]) => partType);

      let productStrings = "";

      const purpose =
        Number(budget) < 80
          ? "사무용"
          : Number(budget) < 100
          ? "저사양"
          : Number(budget) < 200
          ? "보급형"
          : Number(budget) < 600
          ? "고사양"
          : "하이엔드";

      await Promise.all(
        types.map(async (type) => {
          const { data: products, error } = await supabase
            .from<Product>("products")
            .select("product_name, price")
            .eq("type", type)
            .like("purpose", `%${purpose}%`)
            .like(
              "explanation",
              type === "CPU" || type === "MBoard"
                ? purpose === "사무용" || purpose === "보급형"
                  ? "%소켓1700%"
                  : selectCpuType === "Intel"
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

          if (error) {
            // 에러가 발생했을 때 재시도 처리
            if (retryCount < 5) {
              // 재시도 횟수 제한을 추가
              await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기 후 재시도
              return handleEstimate(
                (limit = limit - 10 > 0 ? limit - 10 : 10),
                feedback,
                budgetIssues,
                errorCount + 1,
                retryCount + 1 // 재시도 횟수 증가
              );
            } else {
              throw new Error("재시도 횟수 초과로 중단됩니다.");
            }
          }

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

      console.log(productStrings);

      const genAI = new GoogleGenerativeAI(googleApiKey);

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        safetySettings: safetySettings,
      });

      const prompt = `...`; // 생략

      console.log(prompt);

      const result2 = await model.generateContent(prompt);
      console.log(result2.response.text());

      const parts = parseParts(result2.response.text());

      const price = parts.reduce((acc, part) => acc + part.price, 0);
      if (
        (price >= Number(budget + "0000") * budgetIssues - 200000 &&
          price <= Number(budget + "0000") * budgetIssues + 100000) ||
        false
      ) {
        setBuild(parts);
        setBuilded(false);
      } else {
        handleEstimate(
          limit,
          price - Number(budget + "0000"),
          budgetIssues + 0.5
        );
      }
    } catch (error) {
      console.error("Error:", error);

      // 재시도 횟수 초과 시 처리
      if (retryCount >= 5) {
        console.error("재시도 횟수 초과로 더 이상 시도하지 않습니다.");
        return;
      }

      handleEstimate(
        limit - 10 > 0 ? limit - 20 : 10,
        feedback,
        budgetIssues,
        errorCount
      );
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

  // ----------------------------- [supabase에 Build를 업로드 하는 에이리어] -----------------------------
  const insertBuildData = async () => {
    // 현재 로그인한 사용자 정보 가져오기
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(
        "사용자를 가져오는 중 오류 발생:",
        authError || "사용자가 로그인하지 않았습니다."
      );
      return;
    }

    const uid = user.id; // 로그인한 사용자의 UID
    // build 배열의 각 부품 데이터를 매핑
    const buildData = {
      CPU: build.find((part) => part.type === "CPU")?.name,
      Cooler: build.find((part) => part.type === "Cooler")?.name,
      MBoard: build.find((part) => part.type === "MBoard")?.name,
      RAM: build.find((part) => part.type === "RAM")?.name,
      VGA: build.find((part) => part.type === "VGA")?.name,
      SSD: build.find((part) => part.type === "SSD")?.name || null,
      HDD: build.find((part) => part.type === "HDD")?.name || null,
      Case: build.find((part) => part.type === "Case")?.name || null,
      Power: build.find((part) => part.type === "Power")?.name,
      explanation: build.find((part) => part.type === "설명")?.name,
    };

    // Supabase에 builds 데이터 삽입
    const { data: insertedBuild, error: buildError } = await supabase
      .from("builds") // builds 테이블에 삽입
      .insert([buildData])
      .select(); // 삽입된 데이터 반환

    if (buildError) {
      console.error("Error inserting build data:", buildError);
      return;
    }

    // 삽입된 build의 id를 가져오기
    const build_id = insertedBuild[0].id;

    // saved_builds 테이블에 uid와 build_id 삽입
    const { error: savedBuildsError } = await supabase
      .from("saved_builds")
      .insert([{ uid, build_id }]);

    if (savedBuildsError) {
      console.error("Error inserting into saved_builds:", savedBuildsError);
    } else {
      console.log("Build data and saved_builds entry inserted successfully");
    }
  };

  return (
    <>
      {theme.toLowerCase() === "dark" ? (
        <>
          <main className="bg-gradient-to-r from-sky-500 to-slate-300 bg-[180deg] p-[1px] rounded-[40px] mt-8 mx-4 sm:mx-12 lg:mx-20 h-[66vh]">
            <section className="flex flex-col lg:flex-row bg-[#0d1117] rounded-[40px] w-full h-full">
              <article className="w-full lg:w-1/2 mr-0 lg:mr-4 p-4">
                <section className="p-[1px] rounded-[40px] bg-gradient-to-r from-sky-500 to-slate-300 bg-[180deg] h-full">
                  <section className="bg-[#0d1117] rounded-[40px] px-2 h-full">
                    <ul className="text-gray-300 h-full flex flex-col overflow-y-auto">
                      {partTypes.map((partType, index) => (
                        <li
                          key={partType}
                          className="relative text-lg flex flex-row py-3 pt-2 items-center flex-grow min-h-0"
                        >
                          {/* 스위치 버튼 */}
                          <button
                            onClick={() => toggleSwitch(partType)}
                            className={`w-[2vw] h-[2vw] ml-2 mr-2 ${
                              switchStates[partType]
                                ? "bg-green-500 rounded-full"
                                : "bg-gray-700 rounded-full"
                            }`}
                          ></button>

                          <div className="flex flex-col w-full pr-5">
                            <div className="w-full flex flex-grow justify-between items-center">
                              <span className="text-white pb-[2px] text-[0.95vw]leading-tight">
                                {partType}
                              </span>
                              <span className="text-white pb-[2px] text-[0.7vw]">
                                {build.find((part) => part.type === partType)
                                  ?.price
                                  ? `${build
                                      .find((part) => part.type === partType)
                                      ?.price.toLocaleString()} 원`
                                  : "N/A"}
                              </span>
                            </div>

                            <span className="text-gray-200 text-[0.6vw] pl-1 leading-tight">
                              {build.find((part) => part.type === partType)
                                ?.name || "N/A"}
                            </span>
                          </div>

                          {/* 그라데이션 줄 (마지막 항목 제외) */}
                          {index !== partTypes.length - 1 && (
                            <span
                              className="absolute bottom-0 left-0 w-full h-[2px] opacity-60"
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
                    <div className="w-full h-[22vh] text-base text-left text-white max-h-56 overflow-y-auto">
                      {build.find((item) => item.type === "설명")?.name}
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
        </>
      ) : (
        <>
          <main className="bg-gradient-to-r from-purple-700 via-purple-950 to-black bg-[180deg] p-[1px] rounded-[40px] mt-8 mx-4 sm:mx-12 lg:mx-20 h-[66vh]">
            <section className="flex flex-col lg:flex-row bg-white rounded-[40px] w-full h-full">
              <article className="w-full lg:w-1/2 mr-0 lg:mr-4 p-4">
                <section className="p-[1px] rounded-[40px] bg-gradient-to-r from-purple-700 via-purple-950 to-black bg-[180deg] h-full">
                  <section className="bg-white rounded-[40px] px-2 h-full">
                    <ul className="text-gray-700 h-full flex flex-col overflow-y-auto">
                      {partTypes.map((partType, index) => (
                        <li
                          key={partType}
                          className="relative text-lg flex flex-row py-3 pt-2 items-center flex-grow min-h-0"
                        >
                          {/* 스위치 버튼 */}
                          <button
                            onClick={() => toggleSwitch(partType)}
                            className={`w-[2vw] h-[2vw] ml-2 mr-2 ${
                              switchStates[partType]
                                ? "bg-green-500 rounded-full"
                                : "bg-gray-300 rounded-full"
                            }`}
                          ></button>

                          <div className="flex flex-col w-full pr-5">
                            <div className="w-full flex flex-grow justify-between items-center">
                              <span className="text-gray-700 pb-[2px] text-[0.95vw]leading-tight">
                                {partType}
                              </span>
                              <span className="text-gray-700 pb-[2px] text-[0.7vw]">
                                {build.find((part) => part.type === partType)
                                  ?.price
                                  ? `${build
                                      .find((part) => part.type === partType)
                                      ?.price.toLocaleString()} 원`
                                  : "N/A"}
                              </span>
                            </div>

                            <span className="text-gray-500 text-[0.6vw] pl-1 leading-tight">
                              {build.find((part) => part.type === partType)
                                ?.name || "N/A"}
                            </span>
                          </div>

                          {/* 그라데이션 줄 (마지막 항목 제외) */}
                          {index !== partTypes.length - 1 && (
                            <span
                              className="absolute bottom-0 left-0 w-full h-[2px] opacity-60"
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
                    <div className="w-full h-[22vh] text-base text-left text-black max-h-56 overflow-y-auto">
                      {build.find((item) => item.type === "설명")?.name}
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
              onClick={builded ? undefined : () => handleEstimate()}
              className="w-full ml-20 mr-1 h-16 p-[1px] bg-gradient-to-r from-green-400 to-purple-500 text-xl rounded-full"
            >
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-black">
                {builded ? "Building..." : "Build"}
              </div>
            </button>
            <button
              onClick={insertBuildData}
              className="w-full ml-1 mr-20 h-16 p-[1px] bg-gradient-to-r from-green-400 to-purple-500 text-xl rounded-full"
            >
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-black">
                SAVE
              </div>
            </button>
          </footer>
        </>
      )}
    </>
  );
}

export default Build;
