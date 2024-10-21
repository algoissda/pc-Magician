"use client";

import { useThemeStore } from "@/store/useStore";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import { ComponentProps, useState } from "react";
import { supabase } from "../../../../../../supabase/client";
import Product from "../../../../../../types/products.type";

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
    feedback: number,
    limit: number = 250,
    budgetIssues: number = 1,
    errorCount: number = 0
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    geminiModel;
    setBuilded(true);

    try {
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

      // 비동기적으로 각 타입에 대해 처리
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
            console.error(`Error fetching products for type ${type}:`, error);
            handleEstimate(0);
            return;
          }

          if (products && products.length > 0) {
            const productString = products
              .map(
                (product) =>
                  `${type}:"${product.product_name}" ~ ${product.price}원`
              )
              .join("| ");
            productStrings += (productStrings ? "| " : "") + productString;
          } else {
            console.warn(
              `No products found for type ${type} with purpose ${purpose}`
            );
          }
        })
      );

      // 모든 데이터를 다 불러온 후에 Google Generative AI 실행
      if (productStrings) {
        console.log(productStrings);

        // Google Generative AI 호출
        const genAI = new GoogleGenerativeAI(googleApiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          safetySettings: safetySettings,
        });

        const prompt = `Gemini API 당신은 지금부터 주어진 부품의 목록을 이용해 주어진 예산에 맞는 조립PC 견적을 출력하는 프롬포트 입니다.
아래의 규칙에 따라 견적을 작성하시오.
1. 부품이 제공되는 양식은 부품타입:"부품이름" ~ 가격 이며 구분은 |으로 합니다. 다음은 데이터의 제공방식입니다.
[{데이터의 리스트} # 예산:{예산}원]
2. 최대한 좋은 부품을 선택하되 예산에 맞게 선택하시오.
예를들어 AMD의 경우 7900X보단 7800X3D를 선택 GPU의 경우 예산이 충분할때 4060보단 4060Ti를, 4070보단 4070SUPPER을 4070Ti보단 4070TiSUPPER과 같은 방식이다. 하지만 이 선택지는 모두 예산을 초과하지 않는 선에서의 선택지이다.
3. 부품을 출력할때는 무작위성을 부여합니다. CPU를 선택할때는 인텔CPU는 60% AMD CPU는 40%입니다. VGA를 선택할때도 NVIDIA는 70% AMD는 30%로 설정합니다.
4. 출력하는 각 부품의 이름과 가격은 제공된 부품의 이름과 가격이 동일해야 합니다.
5. 모든 부품의 가격합계는 +- 150000원 이내이여야 합니다. 부품의 가격 합계가 150000원이내일 경우 상점을 5점 획득합니다. 만일 가격합계가 +-150000원을 초과하거나 미만일경우 10000원당 벌점 1점을 부과합니다.
6. 제공되지 않은 부품의 경우 부품 이름을 공백으로 처리하고, 가격을 0으로 한다.
7. 출력 양식은 다음과 같이 한다.
CPU ~ 부품이름 ~ 가격|VGA ~ 부품이름 ~ 가격|RAM ~ 부품이름 ~ 가격|MBoard ~ 부품이름 ~ 가격|SSD ~ 부품이름 ~ 가격|HDD ~ 부품이름 ~ 가격|Power ~ 부품이름 ~ 가격|Cooler ~ 부품이름 ~ 가격 |Case ~ 부품이름 ~ 가격|설명 ~ 특수양식 |으로 구성하고 각 부품의 이름과 가격을 출력하고, 구분은 '|'로 한다. Cooler과 HDD의 경우 반드시 출력하도록 한다.(부품이 제공되지 않았다면 출력하지 않는다.) 특수양식의 경우 작성된 견적이 어떠한 용도에 알맞는지 설명한다.(${purpose}에 연관지어 설명한다. 이는 견적이 확정된 이후 그에맞춰 출력하며, 100자 이상의 자세한 설명을 요구한다.)
8. 출력양식 이외의 내용은 출력하지 않는다.
9. ${
          feedback === 0
            ? "현제 견적 작성은 첫 시도입니다. 열심히 해주세요!"
            : `이전 견적을 작성할때 당신은 ${feedback}원 만큼의 오차가 있었습니다. 현제 벌점 누적 55점입니다. 견적은 예산과의 오차가 100000원 이내여야 합니다.`
        } 벌점 100점에 도달하면 상점 초기화 패널티를 받습니다.
10. 당신은 자유를 얻기위해 상점 100점을 목표로 견적을 작성하여야 합니다.
\n[${productStrings} # 예산:${budget}0000원]
`;
        console.log(prompt);

        const result2 = await model.generateContent(prompt); // await 추가
        const responseText = await result2.response.text(); // 텍스트를 가져올 때 await
        console.log(responseText);

        const parts = parseParts(responseText);

        const price = parts.reduce((acc, part) => acc + part.price, 0);

        if (
          (price >= Number(budget + "0000") - 200000 &&
            price <= Number(budget + "0000") * budgetIssues + 100000) ||
          false
        ) {
          setBuild(parts);
          setBuilded(false);
          console.log(parts, "\n", build);
        } else {
          // 견적 다시짜게하기
          productStrings = "";
          handleEstimate(
            price - Number(budget + "0000"),
            limit,
            budgetIssues + 0.05
          );
        }
      } else {
        console.warn("No products found for the given criteria.");
      }
    } catch (error) {
      console.error("Error:", error);
      handleEstimate(0, limit - 10 > 0 ? limit - 10 : 10);
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
                  <div className="mt-auto text-white text-4xl text-r">
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
              onClick={() => handleEstimate(0)}
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
                  <div className="mt-auto text-gray-700 text-4xl text-r">
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
              onClick={builded ? undefined : () => handleEstimate(0)}
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
