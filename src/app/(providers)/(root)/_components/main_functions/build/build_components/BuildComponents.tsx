import React from "react";

// Part 타입 정의
type Part = {
  type: string;
  name: string;
  price: number;
};

// SwitchButton Props 타입 정의
interface SwitchButtonProps {
  partType: string;
  isActive: boolean;
  toggleSwitch: (partType: string) => void;
}

// InputField Props 타입 정의
interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  theme: string;
}

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

// 스위치 버튼 컴포넌트화
export const SwitchButton = ({
  partType,
  isActive,
  toggleSwitch,
}: SwitchButtonProps) => (
  <button
    onClick={() => toggleSwitch(partType)}
    className={`w-[2vw] h-[2vw] ml-2 mr-2 ${
      isActive ? "bg-green-500 rounded-full" : "bg-gray-700 rounded-full"
    }`}
  ></button>
);

// 입력 필드 컴포넌트화
export const InputField = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  theme,
}: InputFieldProps) => (
  <div className="mb-4 flex items-center w-full">
    <label
      htmlFor={id}
      className={`text-${
        theme === "dark" ? "white" : "black"
      } text-xl text-nowrap`}
    >
      {label}:
    </label>
    <div className="flex items-center w-full">
      <input
        id={id}
        value={value}
        onChange={onChange}
        type="number"
        className={`w-full p-2 border ${
          theme === "dark"
            ? "border-white text-white"
            : "border-gray-400 text-black"
        } bg-transparent rounded mr-2`}
        placeholder={placeholder}
      />
      <span
        className={`text-${
          theme === "dark" ? "white" : "black"
        } text-lg block w-8 text-nowrap`}
      >
        만원
      </span>
    </div>
  </div>
);

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

// 파트 목록 컴포넌트화
export const PartList = ({
  partTypes,
  build,
  switchStates,
  toggleSwitch,
  theme,
}: PartListProps) => (
  <ul
    className={`text-${
      theme === "dark" ? "gray-300" : "gray-700"
    } h-full flex flex-col overflow-y-auto`}
  >
    {partTypes.map((partType, index) => (
      <li
        key={partType}
        className="relative text-lg flex flex-row py-3 pt-2 items-center flex-grow min-h-0"
      >
        <SwitchButton
          partType={partType}
          isActive={switchStates[partType]}
          toggleSwitch={toggleSwitch}
        />
        <div className="flex flex-col w-full pr-5">
          <div className="w-full flex flex-grow justify-between items-center">
            <span
              className={`text-${
                theme === "dark" ? "white" : "gray-700"
              } pb-[2px] text-[0.95vw]`}
            >
              {partType}
            </span>
            <span
              className={`text-${
                theme === "dark" ? "white" : "gray-700"
              } pb-[2px] text-[0.7vw]`}
            >
              {build
                .find((part) => part.type === partType)
                ?.price?.toLocaleString() || "N/A"}{" "}
              원
            </span>
          </div>
          <span
            className={`text-${
              theme === "dark" ? "gray-200" : "gray-500"
            } text-[0.6vw] pl-1`}
          >
            {build.find((part) => part.type === partType)?.name || "N/A"}
          </span>
        </div>
        {index !== partTypes.length - 1 && (
          <span
            className="absolute bottom-0 left-0 w-full h-[2px] opacity-60"
            style={{
              background:
                theme === "dark"
                  ? "linear-gradient(to right, #0ea5e9, #3730a3, #c026d3, #e11d48)"
                  : "linear-gradient(to right, #a855f7 , #6b21a8 , #3b0764 , #000000)",
            }}
          ></span>
        )}
      </li>
    ))}
  </ul>
);
