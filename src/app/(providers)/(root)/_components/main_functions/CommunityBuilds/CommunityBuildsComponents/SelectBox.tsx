/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

// Part 타입 정의
type Part = {
  type: string;
  name: string;
  price: number;
};

// SelectBox Props 타입 정의
interface SelectBoxProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  theme: string;
}

// PartList Props 타입 정의
interface PartListProps {
  partTypes: string[];
  build: Part[];
  switchStates: Record<string, boolean>;
  toggleSwitch: (partType: string) => void;
  theme: string;
}

// 셀렉트 박스 컴포넌트화
export const SelectBox = ({
  id,
  label,
  value,
  onChange,
  options,
  theme,
}: SelectBoxProps) => (
  <li
    className={`px-2 p-1 border rounded  ${
      theme === "dark"
        ? "border-white text-white bg-black"
        : "border-gray-400 text-black bg-white"
    }`}
  >
    {label}
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={`w-20 border-none rounded ${
        theme === "dark" ? "text-white bg-black" : "text-black bg-white"
      } appearance-none`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </li>
);
