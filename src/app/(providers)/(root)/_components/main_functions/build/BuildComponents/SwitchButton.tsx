import React from "react";

// SwitchButton Props 타입 정의
interface SwitchButtonProps {
  partType: string;
  isActive: boolean;
  toggleSwitch: (partType: string) => void;
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
