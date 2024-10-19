"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { ComponentProps, useState, useEffect } from "react";
import { supabase } from "../../../../../../supabase/client";
import Product from "../../../../../../types/products.type";

type Part = {
  type: string;
  name: string;
  price: number;
};

function Build() {
  const [estimateType, setEstimateType] = useState<string>("");
  const [cpuType, setCpuType] = useState<string>("");
  const [gpuType, setGpuType] = useState<string>("");
  const [build, setBuild] = useState<Part[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0); // 총합을 위한 상태 추가
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const partTypes = [
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
    setEstimateType(e.target.value); // 숫자로 변환
  };

  const handleChangeCpuType: ComponentProps<"select">["onChange"] = (e) => {
    setCpuType(e.target.value);
  };

  const handleChangeGpuType: ComponentProps<"select">["onChange"] = (e) => {
    setGpuType(e.target.value);
  };

  const handleEstimate = async () => {
    try {
      const types = ["CPU", "VGA", "RAM", "MBoard", "Power"];
      let productStrings = "";

      await Promise.all(
        types.map(async (type) => {
          let hasMoreData = true;
          let start = 0;
          const limit = 1000;

          while (hasMoreData) {
            const { data: products, error } = await supabase
              .from<Product>("products")
              .select("product_name, price")
              .eq("type", type)
              .like(
                "purpose",
                Number(estimateType) < 50
                  ? "%사무용%"
                  : Number(estimateType) < 80
                  ? "%저사양%"
                  : Number(estimateType) < 155
                  ? "%보급형%"
                  : Number(estimateType) < 250
                  ? "%고사양%"
                  : "%하이엔드%"
              )
              .like(
                "explanation",
                type === "CPU" || type === "MBoard"
                  ? cpuType === "Intel"
                    ? "%소켓1700%"
                    : cpuType === "AMD"
                    ? "%소켓AM%"
                    : "%"
                  : "%"
              )
              .like(
                "product_name",
                type === "VGA"
                  ? gpuType === "NVIDIA"
                    ? "%지포스%"
                    : gpuType === "AMD"
                    ? "%라데온  %"
                    : "%"
                  : "%"
              )
              .range(start, start + limit - 1);

            if (error) throw new Error(error.message);

            if (products && products.length > 0) {
              const productString = products
                .map(
                  (product) =>
                    `${type}:${product.product_name}, ${product.price}원`
                )
                .join("/ ");
              productStrings += (productStrings ? "/ " : "") + productString;
              start += limit;
            } else {
              hasMoreData = false;
            }
          }
        })
      );

      const genAI = new GoogleGenerativeAI(googleApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `${productStrings} 이 부붐을 이용하여 ${estimateType}만원 이내의 조립pc견적을 작성하시오.
      출력하는 각 부품의 이름과 가격은 제공된 부품의 이름과가격이 동일해야한다
      부품명이 제공되지 않을경우 부품이름은 공백으로 가격은 0으로 출력한다.
      출력은 아래와 같이 한다.
      "CPU, 부품이름, 가격/VGA, 부품이름, 가격/RAM, 부품이름, 가격/MBoard, 부품이름, 가격/SSD, 부품이름, 가격/HDD, 부품이름, 가격/Power, 부품이름, 가격/Cooler, 부품이름, 가격 /Case, 부품이름, 가격"각 부품의 이름을 출력하고, 구분은 '/'로 한다.
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
    const parsedParts = input.split("/").map((item) => {
      const [type, name = "", priceString = ""] = item.split(",");
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
    <div>
      <main className="bg-white p-2 rounded-2xl mt-8 mx-4 sm:mx-12 lg:mx-20 h-[66vh]">
        <section className="flex flex-col lg:flex-row bg-black rounded-2xl w-full h-full">
          <article className="w-full lg:w-1/2 mr-0 lg:mr-4 p-4">
            <section className="p-[1px] rounded-xl bg-white h-full">
              <section className="bg-black rounded-xl px-2 h-full">
                <ul className="text-gray-300">
                  {partTypes.map((partType) => (
                    <li
                      key={partType}
                      className="border-b border-gray-700 text-lg flex flex-col py-2 justify-between h-16"
                    >
                      <span className="text-white">{partType}</span>
                      <span className="text-gray-400 text-xs">
                        {build.find((part) => part.type === partType)?.name ||
                          "N/A"}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </section>
          </article>
          <aside className="w-full lg:w-1/2">
            <section className="p-4 relative">
              <div className="mb-4 flex items-center">
                <label htmlFor="estimateType" className="text-white text-xl">
                  예산:
                </label>
                <div className="flex items-center w-full">
                  <input
                    id="estimateType"
                    value={estimateType}
                    onChange={handleChangeEstimateType}
                    type="number"
                    className="w-full p-2 border border-gray-700 bg-[#0f1113] text-white rounded mr-2"
                    placeholder="예산 입력"
                  />
                  <span className="text-purple-400 text-lg block w-8">
                    만원
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="cpuType" className="text-white text-xl">
                  CPU 선호
                </label>
                <select
                  id="cpuType"
                  value={cpuType}
                  onChange={handleChangeCpuType}
                  className="w-full p-2 border border-gray-700 bg-[#0f1113] text-white rounded"
                >
                  <option value="">선호하는 CPU를 선택하세요</option>
                  <option value="Intel">Intel</option>
                  <option value="AMD">AMD</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="gpuType" className="text-white text-xl">
                  GPU 선호
                </label>
                <select
                  id="gpuType"
                  value={gpuType}
                  onChange={handleChangeGpuType}
                  className="w-full p-2 border border-gray-700 bg-[#0f1113] text-white rounded"
                >
                  <option value="">선호하는 GPU를 선택하세요</option>
                  <option value="NVIDIA">NVIDIA</option>
                  <option value="AMD">AMD</option>
                </select>
              </div>
              <div className="text-white text-lg mb-4">
                합계 : {totalPrice} 원
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
  );
}

export default Build;
