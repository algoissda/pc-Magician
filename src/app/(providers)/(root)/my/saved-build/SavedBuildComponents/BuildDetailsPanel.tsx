/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { supabase } from "../../../../../../../supabase/client";
import {
  BuildWithCreationDate,
  BuildWithCreationDateAndTotalPrice,
} from "../../../../../../../types/build.type";
import { CalculatedBuildDetails } from "@/utils/functions.utils";

// Helper function to create part details for a build
const fields = [
  { key: "CPU", label: "CPU" },
  { key: "Cooler", label: "Cooler" },
  { key: "MBoard", label: "MBoard" },
  { key: "RAM", label: "RAM" },
  { key: "VGA", label: "VGA" },
  { key: "SSD", label: "SSD" },
  { key: "HDD", label: "HDD" },
  { key: "Case", label: "Case" },
  { key: "Power", label: "Power" },
] as const;

const createPartDetails = (
  build: CalculatedBuildDetails,
  productPriceMap: Record<string, string>,
  productExplanationMap: Record<string, string>
) => {
  return fields.map(({ key, label }) => {
    const partName = build?.[key];
    const price =
      partName && productPriceMap ? productPriceMap[partName] : "N/A";
    const explanation =
      partName && productExplanationMap
        ? productExplanationMap[partName]
        : "No explanation available.";

    return {
      key,
      label,
      value: partName || "N/A",
      price: price || "N/A",
      explanation, // 각 부품의 explanation 추가
    };
  });
};

interface BuildDetailProps {
  selectedBuild: CalculatedBuildDetails;
  setSelectedBuild: React.Dispatch<
    React.SetStateAction<CalculatedBuildDetails | null>
  >;
  theme: "dark" | "light";
  productPriceMap: Record<string, number>;
  partExplanations: Record<string, string>;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchBuilds: any;
}

export const BuildDetailsPanel: React.FC<BuildDetailProps> = ({
  selectedBuild,
  theme,
  productPriceMap,
  partExplanations, // 각 부품의 explanation 데이터를 전달받음
  onClose,
  fetchBuilds, // fetchBuilds 함수를 prop으로 받음
}) => {
  const [visible, setVisible] = useState(false); // visibility 상태 관리
  const [hoveredPartKey, setHoveredPartKey] = useState<string | null>(null); // 마우스가 올라간 부품의 key를 추적
  const [isDelete, setIsDelete] = useState(false); // 삭제 상태 관리
  const partDetails = createPartDetails(
    selectedBuild,
    Object.fromEntries(
      Object.entries(productPriceMap).map(([key, value]) => [
        key,
        value.toString(),
      ])
    ),
    partExplanations
  );

  // 패널이 열릴 때 opacity 애니메이션 적용
  useEffect(() => {
    if (selectedBuild) {
      setTimeout(() => setVisible(true), 10); // 10ms 후에 visible 상태로 전환
    }
  }, [selectedBuild]);

  // 패널이 닫힐 때 opacity 애니메이션 적용
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 300); // 300ms 후에 실제로 닫히도록 설정 (transition과 맞춤)
  };

  // 저장 버튼 클릭 시 빌드 저장 함수
  const handleDeleteBuild = async () => {
    setIsDelete(true);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      // console.error(
      //   "사용자를 가져오는 중 오류 발생:",
      //   authError || "사용자가 로그인하지 않았습니다."
      // );
      setIsDelete(false);
      return;
    }

    const uid = user.id;
    const build_id = selectedBuild.id;

    try {
      const { error: savedBuildsError } = await supabase
        .from("saved_builds")
        .delete()
        .eq("uid", uid)
        .eq("build_id", build_id);

      if (savedBuildsError) {
        // console.error("Error deleting from saved_builds:", savedBuildsError);
        setIsDelete(false);
        return;
      }

      // console.log("Saved build entry deleted successfully");

      // 삭제 후 목록을 다시 불러오기
      fetchBuilds(1); // 첫 페이지를 로드
      handleClose(); // 패널을 닫음
    } catch (error) {
      setIsDelete(false);
      // console.error("Error deleting build:", error);
    }
  };

  const textThemeStyle = theme === "dark" ? "text-white" : "text-gray-800";
  const backgroundThemeStyle = theme === "dark" ? "bg-[#0d1117]" : "bg-white";
  const lineThemeStyle =
    theme === "dark"
      ? "linear-gradient(to right, #0ea5e9, #3730a3, #c026d3, #e11d48)"
      : "linear-gradient(to right, #a855f7 , #6b21a8 , #3b0764 , #000000)";
  const border_bThemeStyle = `${
    theme === "dark" ? "border-cyan-400" : "border-pink-500"
  }`;
  const explanationStyle = `${backgroundThemeStyle} ${border_bThemeStyle} w-full border-b-2 p-4 transition-all duration-300 absolute top-0 left-0 `;

  return (
    <div
      className={`${backgroundThemeStyle} absolute h-full inset-0 bg-opacity-50 z-40  transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      {/* Explanation Display */}
      <div
        className={`${textThemeStyle} relative left-0 top-0 w-[50%] h-auto text-sm   transition-all duration-300 `}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <span
          className={`${explanationStyle} ${
            hoveredPartKey ? "opacity-0" : "opacity-100"
          }`}
        >
          {" " + selectedBuild?.explanation || "No explanation available."}
        </span>
        {partDetails.map((part) => (
          <span
            key={part.key}
            className={`${explanationStyle} ${
              hoveredPartKey === part.key ? "opacity-100" : "opacity-0"
            }`}
          >
            {" " + part.explanation}
          </span>
        ))}
      </div>
      <div
        className={`${backgroundThemeStyle} theme-color absolute right-0 top-0 w-1/2 h-full p-6 z-50 transform translate-x-0 transition-all duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()} // 패널 내부 클릭 시 닫히지 않도록 방지
      >
        <h3
          className={`text-right font-bold mb-8 text-3xl ${textThemeStyle} transition-all`}
        >
          Build Details
        </h3>
        <ul className={`h-[80%] flex flex-col overflow-y-auto overflow-x-clip`}>
          {partDetails.map((part) => (
            <li
              key={`${part.key}-${part.label}`} // 고유한 key 설정
              className="relative text-lg flex flex-row py-3 pt-2 items-center flex-grow min-h-0"
              onMouseEnter={() => setHoveredPartKey(part.key)}
              onMouseLeave={() => setHoveredPartKey(null)}
            >
              <div className="flex flex-col w-full pr-5">
                <div className="w-full flex flex-grow justify-between items-center">
                  <span className={`${textThemeStyle} pb-[2px] text-[0.95vw]`}>
                    {part.label}
                  </span>
                  <span className={`${textThemeStyle} pb-[2px] text-[0.75vw]`}>
                    {part.price ? part.price.toLocaleString() + " 원" : "N/A"}
                  </span>
                </div>
                <span className={`${textThemeStyle} text-[0.65vw] pl-1`}>
                  {part.value || "N/A"}
                </span>
              </div>
              <span
                className="absolute bottom-0 left-0 w-[101%] h-[3px] opacity-60"
                style={{
                  background: lineThemeStyle,
                }}
              ></span>
            </li>
          ))}
        </ul>
        <div className="flex-row-reverse mt-4 flex items-center w-full justify-between">
          <div
            className={`text-right font-bold text-3xl inline ${textThemeStyle}`}
          >
            {selectedBuild?.totalPrice?.toLocaleString()} 원
          </div>
          <button
            onClick={handleDeleteBuild}
            disabled={isDelete}
            className="w-auto mt-1 py-1 px-5 bg-red-600 text-white font-semibold rounded-md transition-opacity duration-300 hover:bg-red-700"
          >
            {isDelete ? "DELETED" : "DELETE"}
          </button>
        </div>
      </div>
    </div>
  );
};
