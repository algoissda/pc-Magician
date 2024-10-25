import { useState, useEffect } from "react";
import { supabase } from "../../../../../../../../supabase/client";

// Helper function to create part details for a build
const createPartDetails = (build, productPriceMap) => {
  const fields = [
    { key: "CPU", label: "CPU" },
    { key: "VGA", label: "VGA" },
    { key: "RAM", label: "RAM" },
    { key: "MBoard", label: "MBoard" },
    { key: "SSD", label: "SSD" },
    { key: "HDD", label: "HDD" },
    { key: "Power", label: "Power" },
    { key: "Cooler", label: "Cooler" },
    { key: "Case", label: "Case" },
  ];

  return fields.map(({ key, label }) => {
    const partName = build?.[key];
    const price =
      partName && productPriceMap ? productPriceMap[partName] : "N/A";

    return {
      key, // 고유 키 추가
      label,
      value: partName || "N/A",
      price: price || "N/A",
    };
  });
};

// BuildDetailsPanel 컴포넌트
export const BuildDetailsPanel = ({
  selectedBuild,
  theme,
  productPriceMap,
  onClose,
}) => {
  const [visible, setVisible] = useState(false); // visibility 상태 관리
  const [isSaving, setIsSaving] = useState(false); // 저장 상태 관리
  const partDetails = createPartDetails(selectedBuild, productPriceMap);

  const textThemeStyle = theme === "dark" ? "text-white" : "text-gray-800";
  const backgroundThemeStyle = theme === "dark" ? "bg-[#0d1117]" : "bg-white";
  const lineThemeStyle =
    theme === "dark"
      ? "linear-gradient(to right, #0ea5e9, #3730a3, #c026d3, #e11d48)"
      : "linear-gradient(to right, #a855f7 , #6b21a8 , #3b0764 , #000000)";

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
      console.error(
        "사용자를 가져오는 중 오류 발생:",
        authError || "사용자가 로그인하지 않았습니다."
      );
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
    const { data: existingBuild, error: buildCheckError } = await supabase
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

    if (buildCheckError) {
      console.error("Error checking existing build:", buildCheckError);
      setIsSaving(false);
      return;
    }

    let build_id;

    if (existingBuild) {
      build_id = existingBuild.id;
    } else {
      // 동일한 견적이 없으면 새로 삽입
      const { data: insertedBuild, error: buildInsertError } = await supabase
        .from("builds")
        .insert([buildData])
        .select();

      if (buildInsertError) {
        console.error("Error inserting build data:", buildInsertError);
        setIsSaving(false);
        return;
      }

      build_id = insertedBuild[0].id;
      console.log("새로운 build를 삽입했습니다.");
    }

    // saved_builds 테이블에서 동일한 build_id가 있는지 확인
    const { data: existingSavedBuild, error: savedBuildCheckError } =
      await supabase
        .from("saved_builds")
        .select("id")
        .eq("uid", uid)
        .eq("build_id", build_id)
        .maybeSingle();

    if (savedBuildCheckError) {
      console.error(
        "Error checking existing saved build:",
        savedBuildCheckError
      );
      setIsSaving(false);
      return;
    }

    if (existingSavedBuild) {
      // 동일한 build_id가 이미 저장되어 있으면 저장하지 않음
      console.log("동일한 견적이 이미 저장되어 있습니다. 저장하지 않습니다.");
      setIsSaving(true);
      return;
    }

    // 동일한 build_id가 없는 경우 저장
    const { error: savedBuildsError } = await supabase
      .from("saved_builds")
      .insert([{ uid, build_id }]);

    if (savedBuildsError) {
      console.error("Error inserting into saved_builds:", savedBuildsError);
    } else {
      console.log("Build data and saved_builds entry inserted successfully");
    }

    setIsSaving(false);
  };

  return (
    <div
      className={`${backgroundThemeStyle} absolute h-full inset-0 bg-opacity-50 z-40 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose} // 클릭 시 패널 닫기
    >
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
            onClick={handleSaveBuild}
            disabled={isSaving}
            className="w-auto mt-1 py-1 px-5 bg-lime-500 text-white font-semibold rounded-md transition-opacity duration-300 hover:bg-lime-600"
          >
            {!isSaving ? "SAVE" : "SAVED"}
          </button>
        </div>
      </div>
    </div>
  );
};
