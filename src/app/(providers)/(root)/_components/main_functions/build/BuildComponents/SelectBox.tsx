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
  <div className="mb-4 w-full">
    <label
      htmlFor={id}
      className={`text-${theme === "dark" ? "white" : "black"} text-xl`}
    >
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={`w-full p-2 border rounded ${
        theme === "dark"
          ? "border-white text-white bg-black"
          : "border-gray-400 text-black bg-white"
      } appearance-none`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);
