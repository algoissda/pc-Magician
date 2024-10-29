import React from "react";
import { SwitchButton } from "./SwitchButton";

// Part 타입 정의
type Part = {
  type: string;
  name: string;
  price: number;
};

// PartList Props 타입 정의
interface PartListProps {
  partTypes: string[];
  build: Part[];
  switchStates: Record<string, boolean>;
  toggleSwitch: (partType: string) => void;
  theme: string;
}

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
          index={index}
          theme={theme}
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
