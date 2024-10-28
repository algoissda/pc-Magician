/* eslint-disable @next/next/no-img-element */
"use client";

import { useThemeStore } from "@/store/useStore";
import { useState, useRef } from "react";
import { supabase } from "../../../../../../../supabase/client";
import Product from "../../../../../../../types/products.type";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  Part,
} from "@google/generative-ai";
import { PartList } from "./BuildComponents/PartList";
import { InputField } from "./BuildComponents/InputField";
import { SelectBox } from "./BuildComponents/SelectBox";
import Modal from "../../modal/Loginmodal";
import { loadingRandomImgArray } from "./BuildComponents/loadingRandomImgArray";

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

function Build() {
  const theme = useThemeStore((state) => state.theme);
  const [budget, setBudget] = useState<string>("100");
  const [selectCpuType, setCpuType] = useState<string>("");
  const [selectVgaType, setVgaType] = useState<string>("");
  const [build, setBuild] = useState<Part[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [builded, setBuilded] = useState<boolean>(false);
  const [cancelBuild, setCancelBuild] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const cancelTokens = useRef<Array<AbortController>>([]);
  const [loadingImgIndex, setLoadingImgIndex] = useState<number>(
    Math.floor(Math.random() * loadingRandomImgArray.length)
  );

  const apiKeys = [
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY_1,
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY_2,
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY_3,
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY_4,
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY_5,
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY_6,
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY_7,
    process.env.NEXT_PUBLIC_GOOGLE_API_KEY_8,
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

  const initializeGoogleAI = (apiKey: string): GoogleGenerativeAI | null => {
    try {
      if (!apiKey) {
        throw new Error("API 키가 없습니다.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      return genAI;
    } catch (error) {
      console.error("Google AI 초기화 실패:", error);
      return null;
    }
  };

  const createBuild = async (feedback = 0, limit = 250, budgetIssues = 1) => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(
        "사용자를 가져오는 중 오류 발생:",
        authError || "사용자가 로그인하지 않았습니다."
      );
      setIsModalOpen(true);
      return;
    }

    if (builded) {
      // 이미 빌드 중인 경우 취소 처리
      cancelBuildProcess();
      return;
    }

    setSaved(false);
    setBuilded(true);
    setBuild([]);
    setTotalPrice(0);
    setCancelBuild(false); // 취소 플래그 초기화

    const types = Object.entries(switchStates)
      .filter(([partType, isEnabled]) => isEnabled)
      .map(([partType]) => partType);

    let productStrings = "";

    const purpose =
      Number(budget) <= 70
        ? "사무용"
        : Number(budget) <= 100
        ? "저사양"
        : Number(budget) <= 200
        ? "보급형"
        : Number(budget) <= 400
        ? "고사양"
        : "하이엔드";

    try {
      await Promise.all(
        types.map(async (type) => {
          const { data: products, error } = await supabase
            .from<Product>("products")
            .select("product_name, price")
            .eq("type", type)
            .like("purpose", `%${purpose}%`)
            .range(0, limit - 1);

          if (error) {
            console.error(`Error fetching products for type ${type}:`, error);
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

      if (productStrings) {
        console.log(productStrings);

        // 모든 API 키에 대해 각각 요청
        const promises = apiKeys.map(async (apiKey, index) => {
          const genAI = initializeGoogleAI(apiKey);
          if (!genAI) {
            return Promise.resolve(); // API 초기화 실패 시 skip
          }

          const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: safetySettings,
          });

          const prompt = `Gemini API 당신은 지금부터 주어진 부품의 목록을 이용해 주어진 예산에 맞는 조립PC 견적을 출력하는 프롬포트 입니다.
아래의 규칙에 따라 견적을 작성하시오.
1. 부품이 제공되는 양식은 부품타입:"부품이름" ~ 가격 이며 구분은 |으로 합니다. 다음은 데이터의 제공방식입니다.
[{데이터의 리스트} # 예산:{예산}원]
2. 최대한 좋은 부품을 선택하되 예산에 맞게 선택하시오. (사무용이나 저사양같은경우에는 라이젠 4세대도 좀 써라)
예를들어 AMD의 경우 7900X보단 7800X3D를 선택 GPU의 경우 예산이 충분할때 4060보단 4060Ti를, 4070보단 4070SUPPER을 4070Ti보단 4070TiSUPPER과 같은 방식이다. 하지만 이 선택지는 모두 예산을 초과하지 않는 선에서의 선택지이다.
3. 부품을 출력할때는 무작위성을 부여합니다. CPU를 선택할때는 인텔CPU는 60% AMD CPU는 40%입니다. VGA를 선택할때도 NVIDIA는 70% AMD는 30%로 설정합니다.
4. 출력하는 각 부품의 이름과 가격은 제공된 부품의 이름과 가격이 동일해야 합니다. (출력하는 부품의 이름은 제공된 데이터의 부품이름과 완전히 동일해야합니다.)
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

          const abortController = new AbortController();
          cancelTokens.current.push(abortController);

          const result2 = await model.generateContent(prompt, {
            signal: abortController.signal,
          });

          if (abortController.signal.aborted) {
            console.log(`Request ${index + 1} aborted.`);
            return Promise.reject(); // 종료 시 promise를 reject
          }

          const responseText = await result2.response.text();
          console.log(responseText);

          const parts = parseParts(responseText);

          const price = parts.reduce((acc, part) => acc + part.price, 0);

          if (
            price >= Number(budget + "0000") - 200000 &&
            price <= Number(budget + "0000") * budgetIssues + 100000
          ) {
            setBuild(parts);
            setBuilded(false);

            // Cancel ongoing requests
            cancelTokens.current.forEach((token) => token.abort());
            setLoadingImgIndex(
              Math.floor(Math.random() * loadingRandomImgArray.length)
            );
            cancelTokens.current = [];
            return Promise.resolve();
          } else {
            return Promise.reject((feedback = price - Number(budget + "0000")));
          }
        });

        // Fastest successful promise will enable cancelation of the rest
        await Promise.any(promises);
      } else {
        console.warn("No products found for the given criteria.");
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.name === "AbortError") {
        console.log("Build process was canceled.");
      } else {
        console.log("Retrying with adjusted parameters.");
        createBuild(0, limit - 10 > 0 ? limit - 10 : 10);
      }
    }
  };

  // Cancel build process function
  const cancelBuildProcess = () => {
    cancelTokens.current.forEach((token) => token.abort());
    cancelTokens.current = [];
    setBuilded(false);
    setCancelBuild(false); // 취소 상태를 초기화
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
    if (saved) return;
    setSaved(true);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(
        "사용자를 가져오는 중 오류 발생:",
        authError || "사용자가 로그인하지 않았습니다."
      );
      setSaved(false);
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

    const { data: existingBuild, error: buildCheckError } = await supabase
      .from("builds")
      .select("id")
      .eq("CPU", buildData.CPU)
      .eq("Cooler", buildData.Cooler)
      .eq("MBoard", buildData.MBoard)
      .eq("RAM", buildData.RAM)
      .eq("VGA", buildData.VGA)
      .eq("SSD", buildData.SSD)
      .eq("HDD", buildData.HDD)
      .eq("Case", buildData.Case)
      .eq("Power", buildData.Power)
      .eq("total_price", totalPrice)
      .maybeSingle();

    if (buildCheckError) {
      console.error("Error checking existing build:", buildCheckError);
      setSaved(false);
      return;
    }

    let build_id;

    if (existingBuild) {
      build_id = existingBuild.id;
      console.log("동일한 견적을 찾았습니다. 기존 build_id를 사용합니다.");
    } else {
      const { data: insertedBuild, error: buildInsertError } = await supabase
        .from("builds")
        .insert([buildData])
        .select();

      if (buildInsertError) {
        console.error("Error inserting build data:", buildInsertError);
        setSaved(false);
        return;
      }

      build_id = insertedBuild[0].id;
      console.log("새로운 build를 삽입했습니다.");
    }

    const { error: savedBuildsError } = await supabase
      .from("saved_builds")
      .insert([{ uid, build_id }]);

    if (savedBuildsError) {
      console.error("Error inserting into saved_builds:", savedBuildsError);
      setSaved(false);
    } else {
      console.log("Build data and saved_builds entry inserted successfully");
      setSaved(true);
    }
  };

  const textThemeItemStyle = theme === "dark" ? "text-white" : "text-black";
  const textThemeTotalPriceStyle =
    theme === "dark" ? "text-white" : "text-gray-700";
  const textThemeLeftButtonPriceStyle =
    theme === "dark"
      ? "from-sky-400 to-purple-300"
      : "from-purple-500 to-sky-300";
  const textThemeRightButtonPriceStyle =
    theme === "dark"
      ? "from-purple-300 to-sky-400"
      : "from-sky-300 to-purple-500";
  const backgroundBorderThemeStyle =
    theme === "dark"
      ? "bg-[#0d1117] border-sky-400"
      : "bg-white border-pink-500";
  const backgroundBuildedStyle =
    theme === "dark"
      ? builded
        ? "bg-[#3d4043]"
        : "bg-[#0d1117]"
      : builded
      ? "bg-gray-400"
      : "bg-white";
  const blockedPanelBuildedStyle = builded
    ? "opacity-100 pointer-events-auto "
    : "opacity-0 pointer-events-none ";
  const panelThemeStyle = theme === "dark" ? "bg-[#0d1117]" : "bg-white";
  const panelOpacityThemeStyle = theme === "dark" ? "opacity-50" : "opacity-0";
  const panelOpacityThemeStyleReverse =
    theme !== "dark" ? "opacity-70" : "opacity-0";

  return (
    <>
      <main
        className={`${backgroundBorderThemeStyle} relative border-[1px] flex flex-row rounded-[40px] bg-opacity-40 mt-8 mx-20 h-[66vh] overflow-hidden`}
      >
        <div
          className={`${blockedPanelBuildedStyle} ${panelThemeStyle} absolute flex justify-center items-center h-full inset-0 bg-opacity-50 z-40 text-white text-6xl`}
        >
          <span className="z-10 absolute top-[10%] left-[10%]">
            {loadingRandomImgArray[loadingImgIndex]}
          </span>
          <div
            className={`${panelOpacityThemeStyle} absolute theme-opacity top-0 inset-0 bg-cover bg-center bg-[url('https://i.namu.wiki/i/gE76Z7wOdfiXgbnEAcTTfYnxYKd8KbZIK9hjVdA2SOJeg6vmARMmITvtAZQGWZaX1vFv_W21HwocEEcWBHXwMA.gif')] transition-opacity duration-800`}
          ></div>
          <div
            className={`${panelOpacityThemeStyleReverse} absolute theme-opacity top-0 inset-0 bg-cover transition-opacity duration-800 bg-[url('https://lh3.googleusercontent.com/proxy/cEq__V0vkdcIRa8DzYbrP2URzhFFeJSV7Ep6kiUBS1jwfXlSfm3tCdOFp3XGXUlWU1IGVd1WRJcC2z452P-ZLd2qUhuFyJq0wdFxQWTCXtUwRTwMGIY2ihCfOBplKwwclDpWmBzvafFflBQ5ohbGRev0tZU0eanlXJH5Pra3BIEBBBT9vlHK2oAEf3mM86HDxv7z7Sh9NfBoUvWe9fiZD9QODyf-')]`}
          ></div>
        </div>
        <article className="w-3/5 mr-0 lg:mr-4 p-4">
          <section
            className={`${backgroundBorderThemeStyle} border-[1px]  p-[1px] rounded-[40px] bg-opacity-40 px-2 h-full`}
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

        <aside className="w-2/5">
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
                className={`${textThemeItemStyle} w-full h-[22vh] text-base text-left max-h-56 overflow-y-auto`}
              >
                {build.find((item) => item.type === "설명")?.name}
              </div>
            </div>

            <div
              className={`${textThemeTotalPriceStyle} mt-auto text-4xl text-right`}
            >
              {!builded && totalPrice
                ? `${totalPrice.toLocaleString()} 원`
                : "XXX,XXX,XXX 원"}
            </div>
          </section>
        </aside>
      </main>

      <footer className="w-full mt-6 flex justify-center">
        <button
          onClick={() => {
            if (builded) {
              cancelBuildProcess(); // 빌드 취소
            } else {
              createBuild(0); // 빌드 시작
            }
          }}
          className={`${textThemeLeftButtonPriceStyle} w-full ml-20 mr-1 h-16 p-[1px] bg-gradient-to-r rounded-full text-xl`}
        >
          <div
            className={`${backgroundBuildedStyle} ${textThemeItemStyle} w-full h-full rounded-full flex items-center justify-center`}
          >
            {builded ? "Cancel" : "Build"}
          </div>
        </button>
        <button
          onClick={() => (builded || saved ? undefined : insertBuildData())}
          className={`${textThemeRightButtonPriceStyle} w-full ml-1 mr-20 h-16 p-[1px] bg-gradient-to-r rounded-full text-xl`}
        >
          <div
            className={`${backgroundBuildedStyle} ${textThemeItemStyle} w-full h-full rounded-full flex items-center justify-center`}
          >
            {saved ? "SAVED ✓" : "SAVE"}
          </div>
        </button>
      </footer>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6 text-center">
          <h2 className="text-2xl mb-4">로그인이 필요합니다</h2>
          <p>견적을 작성하려면 로그인해주세요.</p>
        </div>
      </Modal>
    </>
  );
}

export default Build;
