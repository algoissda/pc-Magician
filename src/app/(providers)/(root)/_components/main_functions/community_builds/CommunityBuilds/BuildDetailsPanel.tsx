// Helper function to create part details for a build
const createPartDetails = (build, productPriceMap) => {
  // Define the fields and labels for the parts
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

  // Dynamically generate the value and price based on productPriceMap
  return fields.map(({ key, label }) => {
    const partName = build?.[key]; // 해당 부품 이름을 안전하게 추출
    const price =
      partName && productPriceMap ? productPriceMap[partName] : "N/A"; // productPriceMap에서 가격 조회

    return {
      label,
      value: partName || "N/A", // 부품 이름이 없으면 "N/A"
      price: price || "N/A", // 가격이 없으면 "N/A"
    };
  });
};

// BuildDetailsPanel 컴포넌트 안에서 사용
export const BuildDetailsPanel = ({
  selectedBuild,
  theme,
  productPriceMap,
  onClose,
}) => {
  // Generate partDetails array based on selectedBuild and productPriceMap
  const partDetails = createPartDetails(selectedBuild, productPriceMap);

  return (
    <div
      className={`absolute h-full inset-0 bg-black bg-opacity-50 z-40 ${
        selectedBuild
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`theme-opacity absolute right-0 top-0 w-1/2 h-full bg-${
          theme === "dark" ? "[#0d1117]" : "white"
        } p-6 z-50 transition-transform transform translate-x-0`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className={`text-right font-bold mb-8 text-3xl text-${
            theme === "dark" ? "white" : "gray-500"
          }`}
        >
          Build Details
        </h3>
        {selectedBuild && (
          <ul
            className={`text-${
              theme === "dark" ? "gray-100" : "gray-900"
            } h-[80%] flex flex-col overflow-y-auto`}
          >
            {partDetails.map((part, index) => (
              <li
                key={part.label}
                className="relative text-lg flex flex-row py-3 pt-2 items-center flex-grow min-h-0"
              >
                <div className="flex flex-col w-full pr-5">
                  <div className="w-full flex flex-grow justify-between items-center">
                    <span
                      className={`text-${
                        theme === "dark" ? "white" : "gray-700"
                      } pb-[2px] text-[0.95vw]`}
                    >
                      {part.label}
                    </span>
                    <span
                      className={`text-${
                        theme === "dark" ? "white" : "gray-700"
                      } pb-[2px] text-[0.7vw]`}
                    >
                      {part.price ? part.price.toLocaleString() + " 원" : "N/A"}
                    </span>
                  </div>
                  <span
                    className={`text-${
                      theme === "dark" ? "white" : "gray-500"
                    } text-[0.6vw] pl-1`}
                  >
                    {part.value || "N/A"}
                  </span>
                </div>
                {index !== partDetails.length - 1 && (
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
        )}
        <div
          className={`text-right font-bold mt-4 text-3xl text-${
            theme === "dark" ? "white" : "gray-500"
          }`}
        >
          {selectedBuild?.totalPrice?.toLocaleString()} 원
        </div>
      </div>
    </div>
  );
};
