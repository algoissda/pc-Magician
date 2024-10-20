"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { ComponentProps, useState, useEffect } from "react";
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
  const [budget, setBudget] = useState<string>(""); // 예산
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

  const handleEstimate = async () => {
    try {
      // 스위치가 켜져 있는 부품만 필터링
      const types = Object.entries(switchStates)
        .filter(([partType, isEnabled]) => isEnabled) // true인 부품만 필터링
        .map(([partType]) => partType); // 부품 이름만 추출

      let productStrings = "";
      const limit = 100; // 각 type당 N개의 데이터만 가져오기

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
                  ? "%소켓AM%"
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
                  `${type}:${product.product_name}, ${product.price}원`
              )
              .join("/ ");
            productStrings += (productStrings ? "/ " : "") + productString;
          }
        })
      );
      const genAI = new GoogleGenerativeAI(googleApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // AI와 대화형 견적 생성
      const generatePrompt = (productStrings: string, budget: number) => {
        return `
      ${productStrings} 이 부품을 이용하여 현제 예산${
          budget - 2
        }0000원 이내의 조립pc견적을 작성하시오.
      출력하는 각 부품의 이름과 가격은 제공된 부품의 이름과가격이 동일해야한다.
      모든 부품의 가격 합계는 예산보다 작아야 한다.
      부품명이 제공되지 않을경우 부품이름은 공백으로 가격은 0으로 출력한다.
      출력은 아래와 같이 한다.
      "CPU, 부품이름, 가격/VGA, 부품이름, 가격/RAM, 부품이름, 가격/MBoard, 부품이름, 가격/SSD, 부품이름, 가격/HDD, 부품이름, 가격/Power, 부품이름, 가격/Cooler, 부품이름, 가격 /Case, 부품이름, 가격 /설명, 내용"각 부품의 이름을 출력하고, 구분은 '/'로 한다.
      그 이외의 내용은 출력하지 않는다.
      `;
      };

      console.log(`${productStrings} 이 부품을 이용하여 현제 예산${
        budget - 20
      }0000원 이내의 조립pc견적을 작성하시오.
      출력하는 각 부품의 이름과 가격은 제공된 부품의 이름과가격이 동일해야한다.
      모든 부품의 가격 합계는 예산보다 작아야 한다.
      부품명이 제공되지 않을경우 부품이름은 공백으로 가격은 0으로 출력한다.
      출력은 아래와 같이 한다.
      "CPU, 부품이름, 가격/VGA, 부품이름, 가격/RAM, 부품이름, 가격/MBoard, 부품이름, 가격/SSD, 부품이름, 가격/HDD, 부품이름, 가격/Power, 부품이름, 가격/Cooler, 부품이름, 가격 /Case, 부품이름, 가격 /설명, 내용"각 부품의 이름을 출력하고, 구분은 '/'로 한다.
      그 이외의 내용은 출력하지 않는다.
      `);

      const getAiResponse = async (prompt: string) => {
        const result = await model.generateContent(prompt);
        return result.response.text();
      };

      const calculateTotalPrice = (responseText: string) => {
        const parts = parseParts(responseText); // AI 응답에서 부품 목록을 파싱
        const totalPrice = parts.reduce(
          (sum, part) => sum + (part.price || 0),
          0
        );
        return { totalPrice, parts };
      };

      let prompt = generatePrompt(productStrings, budget);
      let aiResponse = await getAiResponse(prompt);

      let { totalPrice, parts } = calculateTotalPrice(aiResponse);

      // 합계가 예산을 초과하는 경우, AI에 다시 요청
      while (totalPrice > budget * 10000 + 100000) {
        console.log(
          `총 가격(${totalPrice}원)이 예산을 초과했습니다. 다시 시도합니다.`
        );
        aiResponse = await getAiResponse(prompt);
        const result = calculateTotalPrice(aiResponse);
        totalPrice = result.totalPrice;
        parts = result.parts;
      }

      console.log(aiResponse);
      setBuild(parts); // AI 응답을 파싱하여 상태 업데이트
    } catch (error) {
      console.error("Error:", error);
      setBuild([]); // 에러 발생 시 초기화
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

  );
}

export default Build;
