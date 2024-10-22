"use client";

import { useThemeStore } from "@/store/useStore";
import { useState } from "react";
import { supabase } from "../../../../../../../supabase/client";
import Product from "../../../../../../../types/products.type";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import {
  PartList,
  InputField,
  SelectBox,
} from "./build_components/BuildComponents";

// Part 타입 정의
type Part = {
  type: string;
  name: string;
  price: number;
};

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

/* ------------------------------- [페이지] --------------------------------------- */
function Build() {
  const theme = useThemeStore((state) => state.theme);
  const [budget, setBudget] = useState<string>("60"); // 예산
  const [selectCpuType, setCpuType] = useState<string>(""); // 선호 CPU
  const [selectVgaType, setVgaType] = useState<string>(""); // 선호 GPU
  const [build, setBuild] = useState<Part[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0); // 총합을 위한 상태 추가
  const [builded, setBuilded] = useState<boolean>(false);
  const apiKeys = [
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY_1,
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY_2,
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY_3,
    // 더 추가 가능
  ];
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

  let currentApiKeyIndex = 0;

  // 동적으로 API 키를 교체하는 함수
  const getApiKey = () => {
    const apiKey = apiKeys[currentApiKeyIndex];
    currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length; // 다음 API 키로 순환
    return apiKey;
  };

  const switchApiKeyOnExhaustion = (error: any) => {
    if (error.response && error.response.status === 429) {
      console.log("API 할당량 초과, 다음 API 키로 전환합니다.");
      currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
    }
  };

  const [switchStates, setSwitchStates] = useState<Record<string, boolean>>(
    partTypes.reduce((acc: Record<string, boolean>, partType: string) => {
      acc[partType] = true;
      return acc;
    }, {})
  );

  const toggleSwitch = (partType: string): void => {
    setSwitchStates((prev) => ({
      ...prev,
      [partType]: !prev[partType],
    }));
  };

  const initializeGoogleAI = (apiKey: string) => {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      return model;
    } catch (error) {
      console.error("Google AI 초기화 실패:", error);
      return null;
    }
  };

  const geminiModel = initializeGoogleAI(() => getApiKey());

  const handleEstimate = async (
    feedback: number,
    limit: number = 250,
    budgetIssues: number = 1
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    geminiModel;
    setBuilded(true);
    const googleApiKey = getApiKey();

    try {
      const types = Object.entries(switchStates)
        .filter(([partType, isEnabled]) => isEnabled)
        .map(([partType]) => partType);

      let productStrings = "";

      const purpose =
        Number(budget) <= 80
          ? "사무용"
          : Number(budget) <= 100
          ? "저사양"
          : Number(budget) <= 200
          ? "보급형"
          : Number(budget) <= 400
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
                ? selectCpuType === "Intel"
                  ? "%소켓1700%"
                  : selectCpuType === "AMD"
                  ? "%소켓AM5%"
                  : purpose === "사무용" || purpose === "보급형"
                  ? "%소켓1700%"
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
            budgetIssues + 0.01
          );
        }
      } else {
        console.warn("No products found for the given criteria.");
      }
    } catch (error) {
      console.error("Error:", error);
      switchApiKeyOnExhaustion(error); // 할당량 초과 시 API 키 교체
      handleEstimate(0, limit - 10 > 0 ? limit - 10 : 10);
    }
  };

  const parseParts = (input: string): Part[] => {
    const parsedParts = input.split("|").map((item) => {
      const [type, name = "", priceString = ""] = item.split("~");
      const price = priceString.trim()
        ? parseInt(priceString.trim().replace(/[^0-9]/g, ""), 10)
        : 0;
      return { type: type.trim(), name: name.trim(), price };
    });

    const total = parsedParts.reduce((acc, part) => acc + part.price, 0);
    setTotalPrice(total);
    return parsedParts;
  };

  const insertBuildData = async () => {
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

    const uid = user.id;
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

    const { data: insertedBuild, error: buildError } = await supabase
      .from("builds")
      .insert([buildData])
      .select();

    if (buildError) {
      console.error("Error inserting build data:", buildError);
      return;
    }

    const build_id = insertedBuild[0].id;

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
    <div>
      <main
        className={`border-[1px] flex flex-row bg-${
          theme === "dark"
            ? "[#0d1117] border-sky-400 "
            : "white border-pink-500 "
        } rounded-[40px] bg-opacity-40 mt-8 mx-20 h-[66vh]`}
      >
        <article className="w-full lg:w-1/2 mr-0 lg:mr-4 p-4">
          <section
            className={`border-[1px]  p-[1px] rounded-[40px] bg-[180deg] h-full bg-${
              theme === "dark"
                ? "[#0d1117] border-sky-400"
                : "white border-pink-500"
            } rounded-[40px] bg-opacity-40 px-2 h-full`}
          >
            <PartList
              partTypes={partTypes}
              build={build}
              switchStates={switchStates}
              toggleSwitch={toggleSwitch}
              theme={theme}
            />
          </section>
        </article>

        <aside className="w-full lg:w-1/2">
          <section className="p-10 h-full flex flex-col">
            <div className="flex flex-wrap h-1/2 mt-7 justify-center">
              <InputField
                id="estimateType"
                label="예산"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="예산 입력"
                theme={theme}
              />

              <SelectBox
                id="cpuType"
                label="CPU 선호"
                value={selectCpuType}
                onChange={(e) => setCpuType(e.target.value)}
                options={["상관없음", "Intel", "AMD"]}
                theme={theme}
              />

              <SelectBox
                id="gpuType"
                label="GPU 선호"
                value={selectVgaType}
                onChange={(e) => setVgaType(e.target.value)}
                options={["상관없음", "NVIDIA", "AMD"]}
                theme={theme}
              />

              <div
                className={`w-full h-[22vh] text-base text-left text-${
                  theme === "dark" ? "white" : "black"
                } max-h-56 overflow-y-auto`}
              >
                {build.find((item) => item.type === "설명")?.name}
              </div>
            </div>

            <div
              className={`mt-auto text-${
                theme === "dark" ? "white" : "gray-700"
              } text-4xl`}
            >
              {totalPrice
                ? `${totalPrice.toLocaleString()} 원`
                : "XXX,XXX,XXX 원"}
            </div>
          </section>
        </aside>
      </main>

      <footer className="mt-6 flex justify-center">
        <button
          onClick={builded ? undefined : () => handleEstimate(0)}
          className={`w-full ml-20 mr-1 h-16 p-[1px] bg-gradient-to-r rounded-full ${
            theme === "dark"
              ? "from-sky-400 to-purple-300"
              : "from-purple-500 to-sky-300"
          } text-xl`}
        >
          <div
            className={`w-full h-full bg-${
              theme === "dark" ? "[#0d1117]" : "white"
            } rounded-full flex items-center justify-center text-${
              theme === "dark" ? "white" : "black"
            }`}
          >
            {builded ? "Building..." : "Build"}
          </div>
        </button>
        <button
          onClick={() => insertBuildData()}
          className={`w-full ml-1 mr-20 h-16 p-[1px] bg-gradient-to-r rounded-full ${
            theme === "dark"
              ? "from-purple-300 to-sky-400"
              : "from-sky-300 to-purple-500"
          } text-xl`}
        >
          <div
            className={`w-full h-full bg-${
              theme === "dark" ? "[#0d1117]" : "white"
            } rounded-full flex items-center justify-center text-${
              theme === "dark" ? "white" : "black"
            }`}
          >
            SAVE
          </div>
        </button>
      </footer>
    </div>
  );
}

export default Build;
