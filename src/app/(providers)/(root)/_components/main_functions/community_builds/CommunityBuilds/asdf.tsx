export const BuildCard = ({ build, theme, onClick }) => {
  return (
    <article
      key={build.id}
      className="flex h-80 flex-col border p-4 rounded-lg shadow-md bg-gray-50 bg-opacity-40 cursor-pointer"
      onClick={onClick}
    >
      <div className="h-[100%] flex flex-wrap content-between">
        <section className="h-1/3">
          <h4 className="font-semibold">CPU</h4>
          <small className="mt-0 line-clamp-none">{build.CPU}</small>
        </section>
        <section className="h-1/3">
          <h4 className="font-semibold">VGA</h4>
          <small className="mt-0 line-clamp-none">{build.VGA}</small>
        </section>
        <section className="h-1/3">
          <h4 className="font-semibold">RAM</h4>
          <small className="mt-0 line-clamp-none">{build.RAM}</small>
        </section>
      </div>
      <hr
        className="h-[2px] opacity-60"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(to right, #0ea5e9, #3730a3, #c026d3, #e11d48)"
              : "linear-gradient(to right, #a855f7 , #6b21a8 , #3b0764 , #000000)",
        }}
      />
      <footer className="text-right font-bold text-xl ">
        {build.totalPrice.toLocaleString()} 원
      </footer>
    </article>
  );
};

const createPartDetails = (build) => {
  // build 객체에서 사용할 필드와 레이블을 정의
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

  // 필드 배열을 기반으로 value와 price를 동적으로 생성하여 배열 반환
  return fields.map(({ key, label }) => ({
    label,
    value: build?.[key] || "N/A",
    price: build?.[`${key}Price`] || "N/A",
  }));
};

// BuildDetailsPanel 컴포넌트 안에서 사용
export const BuildDetailsPanel = ({ selectedBuild, theme, onClose }) => {
  // selectedBuild를 기반으로 partDetails 배열을 생성
  const partDetails = createPartDetails(selectedBuild);

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
        <h3 className="font-bold text-lg mb-4">Build Details</h3>
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
        <div className="text-right font-bold mt-4">
          {selectedBuild?.totalPrice?.toLocaleString()} 원
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
};
