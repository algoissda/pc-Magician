import React from "react";

// InputField Props 타입 정의
interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  theme: string;
}

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
