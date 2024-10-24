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

  const textThemeStyle = theme === "dark" ? "text-white" : "text-gray-800";
  const backgroundThemeStyle = theme === "dark" ? "bg-[#0d1117]" : "bg-white";
  const lineThemeStyle =
    theme === "dark"
      ? "linear-gradient(to right, #0ea5e9, #3730a3, #c026d3, #e11d48)"
      : "linear-gradient(to right, #a855f7 , #6b21a8 , #3b0764 , #000000)";

  return (
    <div
      className={`absolute h-full inset-0 bg-black bg-opacity-50 z-40 ${
        selectedBuild
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <main
        className={`${backgroundThemeStyle}  theme-color absolute right-0 top-[10.6%] w-1/2 h-[90%] p-5 z-50 mr-[25%]  transform translate-x-0`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className={`text-right font-bold mb-8 text-3xl ${textThemeStyle} transition-all`}
        >
          Build Details
        </h3>
        {/* Build Details 요소 담는곳  */}
        <div className="여기에 요소 다담음">
          {selectedBuild && (
            <ul
              className={`h-[50%] flex flex-col overflow-y-auto overflow-x-clip`}
            >
              {partDetails.map((part) => (
                <li
                  key={part.label}
                  className="relative text-lg flex flex-row py-3 pt-2 items-center flex-grow min-h-0"
                >
                  <div className="flex flex-col w-full pr-5">
                    <div className="w-full flex flex-grow justify-between items-center">
                      <span
                        className={`${textThemeStyle} pb-[2px] text-[0.95vw]`}
                      >
                        {part.label}
                      </span>
                      <span
                        className={`${textThemeStyle} pb-[2px] text-[0.75vw]`}
                      >
                        {part.price
                          ? part.price.toLocaleString() + " 원"
                          : "N/A"}
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
          )}
          <div
            className={`text-right font-bold mt-4 text-3xl ${textThemeStyle}`}
          >
            {selectedBuild?.totalPrice?.toLocaleString()} 원
          </div>
          {/* 여기에서 요소 담는곳 끝남 */}
        </div>
      </main>
    </div>
  );
};

export const BuildCard = ({ build, theme, onClick }) => {
  const textThemeH4Style = theme === "dark" ? "text-white" : "text-black";
  const textThemeStyle = theme === "dark" ? "text-gray-200" : "text-gray-900";
  const backgroundThemeStyle =
    theme === "dark"
      ? "bg-[#0d1117] border-sky-400"
      : "bg-white border-pink-500";
  const lineThemeStyle =
    theme === "dark"
      ? "linear-gradient(to right, #0ea5e9, #3730a3, #c026d3, #e11d48)"
      : "linear-gradient(to right, #a855f7 , #6b21a8 , #3b0764 , #000000)";

  return (
    <article
      key={build.id}
      className={`${backgroundThemeStyle} flex h-80 flex-col border p-4 rounded-lg shadow-md bg-opacity-40 cursor-pointer `}
      onClick={onClick}
    >
      <div className="h-[100%] flex flex-wrap content-between">
        <section className="h-1/3">
          <h4 className={`font-semibold ${textThemeH4Style}`}>CPU</h4>
          <small className={`mt-0 line-clamp-none ${textThemeStyle}`}>
            {build.CPU}
          </small>
        </section>
        <section className="h-1/3">
          <h4 className={`font-semibold ${textThemeH4Style}`}>VGA</h4>
          <small className={`mt-0 line-clamp-none ${textThemeStyle}`}>
            {build.VGA}
          </small>
        </section>
        <section className="h-1/3">
          <h4 className={`font-semibold ${textThemeH4Style}`}>RAM</h4>
          <small className={`mt-0 line-clamp-none ${textThemeStyle}`}>
            {build.RAM}
          </small>
        </section>
      </div>
      <span
        className=" bottom-0 left-0 w-full h-[2px] opacity-60"
        style={{
          background: lineThemeStyle,
        }}
      ></span>
      <footer
        className={`text-right font-bold text-xl text-${
          theme === "dark" ? "white" : "black"
        }`}
      >
        <p className="text-sm">생성한 날짜 : {build.created_at}</p>
        {build.totalPrice.toLocaleString()} 원
      </footer>
    </article>
  );
};
