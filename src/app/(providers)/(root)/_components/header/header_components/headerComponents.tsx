"use client";

import React from "react";

// Part 타입 정의
export type Part = {
  type: string;
  name: string;
  price: number;
};

// SwitchButton Props 타입 정의
export interface SwitchButtonProps {
  partType: string;
  isActive: boolean;
  toggleSwitch: (partType: string) => void;
}

// InputField Props 타입 정의
export interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  theme: string;
}

// SelectBox Props 타입 정의
export interface SelectBoxProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  theme: string;
}

// PartList Props 타입 정의
export interface PartListProps {
  partTypes: string[];
  build: Part[];
  switchStates: Record<string, boolean>;
  toggleSwitch: (partType: string) => void;
  theme: string;
}

// SwitchButton 컴포넌트 정의
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
