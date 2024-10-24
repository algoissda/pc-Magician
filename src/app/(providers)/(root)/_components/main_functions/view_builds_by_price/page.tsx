function ViewBuildsByPrice() {


  return (
    <main className="flex items-center justify-center h-full w-full"> {/* 전체 넓이가 안늘어남 */}
      <div className="bg-white w-full max-w-4xl p-10 h-96 overflow-y-auto">
        <h1 className="text-center">ViewBuildsByPricePage</h1>

        <div className="mt-8">
          {Array.from({ length: 15 }, (_, i) => {
            const price = 60 + i * 10; {/* 배열로 돌려서 임시로 몇만원대인지 임시로 반복 시킴 */}
            return (
              <div key={price}>
                <span className="bg-gray-200 p-1 mb-2 inline-block">{price}만원 때</span>
                <ul className="flex space-x-4 mb-6">
                  <li>항목 1</li>
                  <li>항목 2</li>
                  <li>항목 3</li>
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default ViewBuildsByPrice;
