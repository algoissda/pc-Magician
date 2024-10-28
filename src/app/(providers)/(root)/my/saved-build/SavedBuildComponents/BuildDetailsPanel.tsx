import { useEffect, useState } from "react";
import { supabase } from "../../../../../../../supabase/client";

// createPartDetails 함수 정의
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

  return fields.map(({ key, label }, index) => {
    const partName = build?.[key];
    const price =
      partName && productPriceMap ? productPriceMap[partName] : "N/A";

    return {
      key: `${key}-${index}`, // 고유 키 추가
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
  fetchBuilds, // fetchBuilds 함수를 prop으로 받음
}) => {
  const [visible, setVisible] = useState(false); // visibility 상태 관리
  const [isDelete, setIsDelete] = useState(false); // 삭제 상태 관리
  const partDetails = createPartDetails(selectedBuild, productPriceMap);

  const textThemeStyle = theme === "dark" ? "text-white" : "text-gray-800";
  const backgroundThemeStyle = theme === "dark" ? "bg-[#0d1117]" : "bg-white";
  const lineThemeStyle =
    theme === "dark"
      ? "linear-gradient(to right, #0ea5e9, #3730a3, #c026d3, #e11d48)"
      : "linear-gradient(to right, #a855f7 , #6b21a8 , #3b0764 , #000000)";

  useEffect(() => {
    if (selectedBuild) {
      setTimeout(() => setVisible(true), 10);
    }
  }, [selectedBuild]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(), 300);
  };

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

  return (
    <div
      className={`${backgroundThemeStyle} absolute h-full inset-0 bg-opacity-50 z-40 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`${backgroundThemeStyle} theme-color absolute right-0 top-0 w-1/2 h-full p-6 z-50 transform translate-x-0 transition-all duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-right font-bold mb-8 text-3xl ${textThemeStyle}`}>
          Build Details
        </h3>
        <ul className={`h-[80%] flex flex-col overflow-y-auto overflow-x-clip`}>
          {partDetails.map((part) => (
            <li
              key={part.label}
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
            onClick={handleDeleteBuild}
            className="w-auto mt-1 py-1 px-5 bg-red-600 text-white font-semibold rounded-md transition-opacity duration-300 hover:bg-red-700"
          >
            {isDelete ? "DELETED" : "DELETE"}
          </button>
        </div>
      </div>
    </div>
  );
};
