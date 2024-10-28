import React from "react";
import {
  BsCpuFill,
  BsFillMotherboardFill,
  BsDeviceSsdFill,
  BsDeviceHddFill,
} from "react-icons/bs";
import { GiComputerFan } from "react-icons/gi";
import { GrFanOption } from "react-icons/gr";
import { LuPcCase } from "react-icons/lu";
import { PiMemoryFill, PiGraphicsCardFill } from "react-icons/pi";

const icons = [
  <BsCpuFill />,
  <GiComputerFan />,
  <BsFillMotherboardFill />,
  <PiMemoryFill />,
  <PiGraphicsCardFill />,
  <BsDeviceSsdFill />,
  <BsDeviceHddFill />,
  <LuPcCase />,
  <GrFanOption />,
];

// SwitchButton Props 타입 정의
interface SwitchButtonProps {
  partType: string;
  isActive: boolean;
  toggleSwitch: (partType: string) => void;
  index: number;
}

// 스위치 버튼 컴포넌트화
export const SwitchButton = ({
  partType,
  isActive,
  toggleSwitch,
  index,
}: SwitchButtonProps) => (
  <button
    onClick={() => toggleSwitch(partType)}
    className={`mx-2 flex justify-center items-center`}
  >
    <span
      className={`text-4xl transition duration-[0s] ${
        isActive ? "text-green-500" : "text-red-900"
      }`}
    >
      {icons[index]}
    </span>
  </button>
);
