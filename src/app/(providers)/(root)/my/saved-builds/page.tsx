function MySavedBuildsPage() {
  return (
    <main className="text-white">
      <h2 className="mt-10 text-3xl font-bold ml-20">저장된 견적</h2>

      <section className="max-h-max">
        <div className="flex flex-wrap justify-start mt-8 mx-20">
          <div className="p-4 m-2 w-full max-w-xs flex flex-col justify-between border-double rounded-2xl custom-border">
            {/* RGB 색상을 만들기 위해 커스텀 보더를 따로 만들었음 */}
            <style jsx>{`
              .custom-border {
                border-width: 4px;
                border-image: linear-gradient(260deg, violet, skyblue, white) 1;
              }
            `}</style>
            <h3 className="ml-5">JUN - estimate1</h3>
            <ul className=" pl-5 pr-5 text-gray-300 pb-6 pt-2">
              <li>CPU</li>
              <li className="border-b border-b-gray-500 pb-5"></li>
              <li>Cooler</li>
              <li className="border-b border-b-gray-500 pb-5"></li>
              <li>MBoard</li>
              <li className="border-b border-b-gray-500 pb-5"></li>
              <li>RAM</li>
              <li className="border-b border-b-gray-500 pb-5"></li>
              <li>VGA</li>
              <li className="border-b border-b-gray-500 pb-5"></li>
              <li>SSD</li>
              <li className="border-b border-b-gray-500 pb-5"></li>
              <li>HDD</li>
              <li className="border-b border-b-gray-500 pb-5"></li>
              <li>Case</li>
              <li className="border-b border-b-gray-500 pb-5"></li>
              <li>Power</li>
              <li className="border-b border-b-gray-500 pb-5"></li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

export default MySavedBuildsPage;
