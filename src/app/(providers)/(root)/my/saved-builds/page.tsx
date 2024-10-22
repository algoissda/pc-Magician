// "use client";

// import { useThemeStore } from "@/store/useStore";
// import { supabase } from "../../../../../../supabase/client";
// import { useEffect, useState } from "react";
// import { useActiveStore } from "@/store/useActiveTab";

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const MySavedBuildsPage = () => {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const [builds, setBuilds] = useState<any[]>([]);
//   const [selectedBuild, setSelectedBuild] = useState<any | null>(null); // 선택된 빌드
//   const [page, setPage] = useState(1);
//   const buildsPerPage = 100;
//   const theme = useThemeStore((state) => state.theme);
//   const activeTab = useActiveStore((state) => state.activeTab);

//   // fetch build 하기위한 함수
//   const fetchBuilds = async () => {
//     try {
//       console.log("Fetching community builds...");
//       // 사용자의 인증 상태를 확인합니다.
//       const { data: userData, error: userError } =
//         await supabase.auth.getUser();
//       let userId = null;

//       if (userError || !userData?.user) {
//         console.warn(
//           "User is not logged in or an error occurred: " + userError?.message
//         );
//       } else {
//         userId = userData.user.id;
//       }

//       // saved_builds 테이블에서 빌드를 조회합니다.
//       let query = supabase.from("saved_builds").select("uid, build_id");

//       // 로그인한 사용자의 빌드를 제외하고 조회 (로그인 상태일 때만)
//       if (userId) {
//         query = query.neq("uid", userId); // 로그인한 사용자의 빌드를 제외
//       }

//       const { data: savedBuilds, error: savedBuildsError } = await query;
//       if (savedBuildsError || !savedBuilds?.length) {
//         console.warn("No saved builds found or an error occurred.");
//         return;
//       }

//       // 빌드 ID를 통해 builds 데이터를 가져옵니다.
//       const buildIds = [...new Set(savedBuilds.map((build) => build.build_id))];
//       const { data: buildsData, error: buildsDataError } = await supabase
//         .from("builds")
//         .select("*")
//         .in("id", buildIds);
//       if (buildsDataError || !buildsData) {
//         throw new Error("Error fetching builds: " + buildsDataError.message);
//       }

//       // 제품 이름으로 가격을 조회합니다.
//       const productNames = buildsData
//         .flatMap((build) => [
//           build.Case,
//           build.Cooler,
//           build.CPU,
//           build.HDD,
//           build.MBoard,
//           build.Power,
//           build.RAM,
//           build.SSD,
//           build.VGA,
//         ])
//         .filter((part) => part !== null);

//       const { data: productsData, error: productsError } = await supabase
//         .from("products")
//         .select("product_name, price")
//         .in("product_name", productNames);
//       if (productsError || !productsData) {
//         throw new Error(
//           "Error fetching product prices: " + productsError.message
//         );
//       }

//       // 제품 가격 정보를 매핑합니다.
//       const productPriceMap = productsData.reduce((acc, product) => {
//         acc[product.product_name] = product.price;
//         return acc;
//       }, {});

//       // 빌드별 총 가격을 계산하고 업데이트합니다.
//       const buildsWithPrices = buildsData.map((build) => {
//         const totalPrice = [
//           build.Case,
//           build.Cooler,
//           build.CPU,
//           build.HDD,
//           build.MBoard,
//           build.Power,
//           build.RAM,
//           build.SSD,
//           build.VGA,
//         ].reduce((sum, part) => sum + (productPriceMap[part] || 0), 0);

//         return { ...build, totalPrice };
//       });

//       setBuilds(buildsWithPrices);
//     } catch (error) {
//       console.error(error.message);
//     }
//   };

//   // Detect changes in activeTab and execute fetchBuilds when it is "Community Builds"
//   useEffect(() => {
//     if (activeTab === "Community Builds") {
//       console.log("asdf");
//       fetchBuilds();
//       console.log(builds);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeTab]); // Runs when activeTab changes

//   // build_id로 다시 데이터 조회 후 패널에 표시할 함수
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const fetchBuildDetails = async (buildId: any) => {
//     try {
//       const { data: buildDetails, error: buildDetailsError } = await supabase
//         .from("builds")
//         .select("*")
//         .eq("id", buildId)
//         .single();
//       if (buildDetailsError) {
//         throw new Error(
//           "Error fetching build details: " + buildDetailsError.message
//         );
//       }

//       const productNames = [
//         buildDetails.Case,
//         buildDetails.Cooler,
//         buildDetails.CPU,
//         buildDetails.HDD,
//         buildDetails.MBoard,
//         buildDetails.Power,
//         buildDetails.RAM,
//         buildDetails.SSD,
//         buildDetails.VGA,
//       ].filter((part) => part !== null);

//       const { data: productsData, error: productsError } = await supabase
//         .from("products")
//         .select("product_name, price")
//         .in("product_name", productNames);
//       if (productsError) {
//         throw new Error(
//           "Error fetching product prices: " + productsError.message
//         );
//       }

//       // 제품 가격 매핑
//       const productPrices = productsData.reduce((acc, product) => {
//         acc[product.product_name] = product.price;
//         return acc;
//       }, {});

//       console.log("Product Prices:", productPrices); // Debugging line for product prices

//       // 총 가격 계산
//       const totalPrice = productNames.reduce(
//         (sum, part) => sum + (productPrices[part] || 0),
//         0
//       );

//       const buildWithPrices = {
//         ...buildDetails,
//         totalPrice,
//         CasePrice: productPrices[buildDetails.Case] || "N/A",
//         CoolerPrice: productPrices[buildDetails.Cooler] || "N/A",
//         CPUPrice: productPrices[buildDetails.CPU] || "N/A",
//         HDDPrice: productPrices[buildDetails.HDD] || "N/A",
//         MBoardPrice: productPrices[buildDetails.MBoard] || "N/A",
//         PowerPrice: productPrices[buildDetails.Power] || "N/A",
//         RAMPrice: productPrices[buildDetails.RAM] || "N/A",
//         SSDPrice: productPrices[buildDetails.SSD] || "N/A",
//         VGAPrice: productPrices[buildDetails.VGA] || "N/A",
//       };

//       setSelectedBuild(buildWithPrices);
//     } catch (error) {
//       console.error(error.message);
//     }
//   };

//   return (
//     <main className="text-white">
//       <h2 className="mt-10 text-3xl font-bold ml-20">저장된 견적</h2>
//       <section className="max-h-max">
//         <div className="p-4 m-2 w-full max-w-xs flex flex-col justify-between border rounded-2xl custom-border">
//           {/* RGB 색상을 만들기 위해 커스텀 보더를 따로 만들었음 */}
//           <style jsx>{`
//             .custom-border {
//               border-width: 4px;
//               border-image: linear-gradient(260deg, violet, skyblue, white) 1;
//             }
//           `}</style>

//           <div className="relative w-full h-full pb-8">
//             <section className="relative h-full border-t border-b border-gray-300 py-4 bg-gray-600 bg-opacity-30 px-2">
//               <div className="w-full h-full overflow-hidden max-h-[100%]">
//                 {/* 패널 표시 */}
//                 <div
//                   className={`absolute h-full inset-0 bg-black bg-opacity-50 z-40 ${
//                     selectedBuild ? "block" : "hidden"
//                   }`}
//                   onClick={() => setSelectedBuild(null)} // 빈 공간 클릭 시 패널 닫기
//                 >
//                   <div
//                     className="absolute right-0 top-0 w-1/2 h-full bg-white p-6 z-50 transition-transform transform translate-x-0"
//                     onClick={(e) => e.stopPropagation()} // 패널 클릭 시 닫히지 않도록
//                   >
//                     <h3 className="font-bold text-lg mb-4">Build Details</h3>
//                     {selectedBuild && (
//                       <ul
//                         className={`text-${
//                           theme === "dark" ? "gray-300" : "gray-700"
//                         } h-[80%] flex flex-col overflow-y-auto`}
//                       >
//                         {[
//                           {
//                             label: "CPU",
//                             value: selectedBuild.CPU,
//                             price: selectedBuild.CPUPrice,
//                           },
//                           {
//                             label: "VGA",
//                             value: selectedBuild.VGA,
//                             price: selectedBuild.VGAPrice,
//                           },
//                           {
//                             label: "RAM",
//                             value: selectedBuild.RAM,
//                             price: selectedBuild.RAMPrice,
//                           },
//                           {
//                             label: "MBoard",
//                             value: selectedBuild.MBoard,
//                             price: selectedBuild.MBoardPrice,
//                           },
//                           {
//                             label: "SSD",
//                             value: selectedBuild.SSD,
//                             price: selectedBuild.SSDPrice,
//                           },
//                           {
//                             label: "HDD",
//                             value: selectedBuild.HDD,
//                             price: selectedBuild.HDDPrice,
//                           },
//                           {
//                             label: "Power",
//                             value: selectedBuild.Power,
//                             price: selectedBuild.PowerPrice,
//                           },
//                           {
//                             label: "Cooler",
//                             value: selectedBuild.Cooler,
//                             price: selectedBuild.CoolerPrice,
//                           },
//                           {
//                             label: "Case",
//                             value: selectedBuild.Case,
//                             price: selectedBuild.CasePrice,
//                           },
//                         ].map((part, index, partTypes) => (
//                           <li
//                             key={part.label}
//                             className="relative text-lg flex flex-row py-3 pt-2 items-center flex-grow min-h-0"
//                           >
//                             <div className="flex flex-col w-full pr-5">
//                               <div className="w-full flex flex-grow justify-between items-center">
//                                 <span
//                                   className={`text-${
//                                     theme === "dark" ? "white" : "gray-700"
//                                   } pb-[2px] text-[0.95vw]`}
//                                 >
//                                   {part.label}
//                                 </span>
//                                 <span
//                                   className={`text-${
//                                     theme === "dark" ? "white" : "gray-700"
//                                   } pb-[2px] text-[0.7vw]`}
//                                 >
//                                   {part.price
//                                     ? part.price.toLocaleString() + " 원"
//                                     : "N/A"}
//                                 </span>
//                               </div>
//                               <span
//                                 className={`text-${
//                                   theme === "dark" ? "gray-200" : "gray-500"
//                                 } text-[0.6vw] pl-1`}
//                               >
//                                 {part.value || "N/A"}
//                               </span>
//                             </div>
//                             {index !== partTypes.length - 1 && (
//                               <span
//                                 className="absolute bottom-0 left-0 w-full h-[2px] opacity-60"
//                                 style={{
//                                   background:
//                                     theme === "dark"
//                                       ? "linear-gradient(to right, #0ea5e9, #3730a3, #c026d3, #e11d48)"
//                                       : "linear-gradient(to right, #a855f7, #6b21a8, #3b0764, #000000)",
//                                 }}
//                               ></span>
//                             )}
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                     <div className="text-right font-bold mt-4">
//                       {selectedBuild?.totalPrice?.toLocaleString()} 원
//                     </div>
//                     <button
//                       className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
//                       onClick={() => setSelectedBuild(null)}
//                     >
//                       닫기
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </section>

//             <h3 className="ml-5">JUN - estimate1</h3>
//             <ul className="pl-5 pr-5 text-gray-300 pb-6 pt-2">
//               <li>CPU</li>
//               <li className="border-b border-b-gray-500 pb-5"></li>
//               <li>Cooler</li>
//               <li className="border-b border-b-gray-500 pb-5"></li>
//               <li>MBoard</li>
//               <li className="border-b border-b-gray-500 pb-5"></li>
//               <li>RAM</li>
//               <li className="border-b border-b-gray-500 pb-5"></li>
//               <li>VGA</li>
//               <li className="border-b border-b-gray-500 pb-5"></li>
//               <li>SSD</li>
//               <li className="border-b border-b-gray-500 pb-5"></li>
//               <li>HDD</li>
//               <li className="border-b border-b-gray-500 pb-5"></li>
//               <li>Case</li>
//               <li className="border-b border-b-gray-500 pb-5"></li>
//               <li>Power</li>
//               <li className="border-b border-b-gray-500 pb-5"></li>
//             </ul>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// };
// export default MySavedBuildsPage;
