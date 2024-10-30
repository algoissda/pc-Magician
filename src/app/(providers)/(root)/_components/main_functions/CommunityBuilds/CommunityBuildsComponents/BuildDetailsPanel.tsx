import { useState, useEffect } from "react";
import { supabase } from "../../../../../../../../supabase/client";

// Helper function to create part details for a build
const createPartDetails = (build, productPriceMap, productExplanationMap) => {
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
  ];

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

//타입지정
type SelectedBuild = {
  id: string;
  CPU: string;
  VGA: string;
  RAM: string;
  Cooler: string;
  HDD: string;
  SSD: string;
  MBoard: string;
  Power: string;
  Case: string;
  explanation: string;
  totalPrice: number;
};

type DetailsPanelProps = {
  selectedBuild: SelectedBuild;
  theme: "dark" | "light";
  productPriceMap: string;
  partExplanations: string;
  onClose: () => void;
};

export const BuildDetailsPanel: React.FC<DetailsPanelProps> = ({
  selectedBuild,
  theme,
  productPriceMap,
  partExplanations, // 각 부품의 explanation 데이터를 전달받음
  onClose,
}) => {
  const [visible, setVisible] = useState(false); // visibility 상태 관리
  const [hoveredPartKey, setHoveredPartKey] = useState(null); // 마우스가 올라간 부품의 key를 추적
  const [isSaving, setIsSaving] = useState(false); // 저장 상태 관리
  const partDetails = createPartDetails(
    selectedBuild,
    productPriceMap,
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
  const handleSaveBuild = async () => {
    setIsSaving(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setIsSaving(false);
      return;
    }

    const uid = user.id;
    const buildData = {
      CPU: selectedBuild.CPU,
      Cooler: selectedBuild.Cooler,
      MBoard: selectedBuild.MBoard,
      RAM: selectedBuild.RAM,
      VGA: selectedBuild.VGA,
      SSD: selectedBuild.SSD,
      HDD: selectedBuild.HDD,
      Case: selectedBuild.Case,
      Power: selectedBuild.Power,
      explanation: selectedBuild.explanation,
    };

    // 동일한 견적이 있는지 확인
    const { data: existingBuild } = await supabase
      .from("builds")
      .select("id")
      .eq("CPU", buildData.CPU)
      .eq("Cooler", buildData.Cooler)
      .eq("MBoard", buildData.MBoard)
      .eq("RAM", buildData.RAM)
      .eq("VGA", buildData.VGA)
      .eq("SSD", buildData.SSD)
      .eq("HDD", buildData.HDD)
      .eq("Case", buildData.Case)
      .eq("Power", buildData.Power)
      .maybeSingle();

    let build_id;

    if (existingBuild) {
      build_id = existingBuild.id;
    } else {
      // 동일한 견적이 없으면 새로 삽입
      const { data: insertedBuild } = await supabase
        .from("builds")
        .insert([buildData])
        .select();

      build_id = insertedBuild![0].id;
    }

    const { data: existingSavedBuild } = await supabase
      .from("saved_builds")
      .select("id")
      .eq("uid", uid)
      .eq("build_id", build_id)
      .maybeSingle();

    if (!existingSavedBuild) {
      await supabase.from("saved_builds").insert([{ uid, build_id }]);
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
  const shadowThemeStyle = `${
    theme === "dark"
      ? "shadow-[rgba(34,211,238,0.7)]"
      : "shadow-[rgba(236,72,153,0.7)]"
  }`;
  const explanationStyle = `${backgroundThemeStyle} ${border_bThemeStyle} ${shadowThemeStyle} shadow-lg w-full border-b-2 p-4 transition-all duration-300 absolute top-0 left-0 `;

  return (
    <div
      className={`${backgroundThemeStyle} absolute h-full inset-0 bg-opacity-50 z-40  transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      {/* Explanation Display */}
      <div
        className={`${textThemeStyle} relative left-0 top-0 w-[50%] h-full text-sm transition-all duration-300 overflow-hidden`}
      >
        <span
          className={`${explanationStyle} ${
            hoveredPartKey ? "opacity-0" : "opacity-100"
          } absolute top-0 left-0`}
        >
          {" " + selectedBuild?.explanation || "No explanation available."}
        </span>
        {partDetails.map((part) => (
          <span
            key={part.key}
            className={`${explanationStyle} ${
              hoveredPartKey === part.key ? "opacity-100" : "opacity-0"
            } absolute top-0 left-0`}
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
            className={`text-right font-bold text-3xl inline  ${textThemeStyle}`}
          >
            {selectedBuild?.totalPrice?.toLocaleString()} 원
          </div>
          <button
            onClick={handleSaveBuild}
            disabled={isSaving}
            className={`w-auto mt-1 py-1 px-5 ${
              theme === "dark"
                ? "bg-cyan-400 hover:bg-cyan-600"
                : "bg-pink-500 hover:bg-pink-600"
            }  text-white font-semibold rounded-md transition-all duration-300`}
          >
            {!isSaving ? "SAVE" : "SAVED"}
          </button>
        </div>
      </div>
    </div>
  );
};
