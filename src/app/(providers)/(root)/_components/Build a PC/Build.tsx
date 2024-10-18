"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useState, ComponentProps } from "react";
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
  const [build, setBuild] = useState<Part[]>([]); // 여기에 부품 종류별로 ㅍㄹ요한 정보들이 들어있음 객체임
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

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
                    ? "%소켓1700%"
                    : gpuType === "AMD"
                    ? "%소켓AM%"
                    : "%"
                  : "%"
              )
              .range(start, start + limit - 1);

            if (error) throw new Error(error.message);

            if (products && products.length > 0) {
              const productString = products
                .map((product) => `${product.product_name}, ${product.price}원`)
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
      출력은 아래와 같이 한다.
      "CPU, 부품이름, 가격/VGA, 부품이름, 가격/RAM, 부품이름, 가격/MBoard, 부품이름, 가격/SSD, 부품이름, 가격/HDD, 부품이름, 가격/Power, 부품이름, 가격/Cooler, 부품이름, 가격 /Case, 부품이름, 가격"각 부품의 이름을 출력하고, 구분은 '/'로 한다.
      그 이외의 내용은 출력하지 않는다.`;

      const result2 = await model.generateContent(prompt);
      console.log(result2.response.text());
      setBuild(parseParts(result2.response.text()));
    } catch (error) {
      console.error("Error:", error);
      setBuild([]);
    }
  };

  const parseParts = (input: string): Part[] => {
    return input.split("/").map((item) => {
      const [type, name = "", priceString = ""] = item.split(",");
      const price = priceString.trim()
        ? parseInt(priceString.trim().replace(/[^0-9]/g, ""), 10)
        : 0;
      return { type: type.trim(), name: name.trim(), price };
    });
  };

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

  return (
    <div className="flex">
      <div className="w-1/3 pr-4">
        <h3 className="text-2xl font-semibold text-white mb-3">부품 목록</h3>
        <div className="rounded-lg border border-gray-500 p-4">
          <ul className="pl-5 pr-5 text-gray-300 pb-6 pt-2">
            {partTypes.map((partType) => (
              <React.Fragment key={partType}>
                <li>{partType}</li>
                <li className="border-b border-b-gray-500 pb-5">
                  {build.find((part) => part.type === partType)?.name || "N/A"}
                </li>
              </React.Fragment>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-2/3">
        <h3 className="text-2xl font-semibold text-white">예산</h3>
        <input
          value={estimateType}
          onChange={handleChangeEstimateType}
          type="number"
          className="w-1/2 p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded"
          placeholder="예산 입력"
        />
        <h3 className="text-2xl font-semibold text-white">CPU 선호</h3>
        <select
          value={cpuType}
          onChange={handleChangeCpuType}
          className="w-1/2 p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded"
        >
          <option value="">선호하는 CPU를 선택하세요</option>
          <option value="Intel">Intel</option>
          <option value="AMD">AMD</option>
        </select>
        <h3 className="text-2xl font-semibold text-white">GPU 선호</h3>
        <select
          value={gpuType}
          onChange={handleChangeGpuType}
          className="w-1/2 p-2 mb-4 border border-gray-700 bg-gray-800 text-white rounded"
        >
          <option value="">선호하는 GPU를 선택하세요</option>
          <option value="NVIDIA">NVIDIA</option>
          <option value="AMD">AMD</option>
        </select>
        <button
          onClick={handleEstimate}
          className="mt-4 w-full py-2 bg-green-600 text-white rounded hover:bg-green-500"
        >
          견적 생성
        </button>
      </div>
    </div>
  );
}

export default Build;
