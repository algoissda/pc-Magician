"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { useActiveStore } from "@/store/useActiveTab";
import { useThemeStore } from "@/store/useStore";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../../../../../supabase/client";
import { BuildCard } from "./CommunityBuildsComponents/BuildCard";
import { BuildDetailsPanel } from "./CommunityBuildsComponents/BuildDetailsPanel";

const CommunityBuilds = () => {
  const [builds, setBuilds] = useState<any[]>([]);
  const [selectedBuild, setSelectedBuild] = useState<any | null>(null); // 선택된 빌드를 저장
  const [selectedBuildPriceMap, setSelectedBuildPriceMap] = useState<
    any | null
  >(null); // 가격 정보 저장
  const [visibleCards, setVisibleCards] = useState<boolean[]>([]); // BuildCard의 표시 상태 관리
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false); // 다음 페이지가 있는지 확인
  const buildsPerPage = 24; // 한 페이지에 표시할 빌드 수
  const theme = useThemeStore((state) => state.theme);
  const activeTab = useActiveStore((state) => state.activeTab);

  const tabChange = useRef(true); // useRef로 tabChange 상태 관리

  // 빌드를 가져오는 함수
  const fetchBuilds = async (pageNumber: number) => {
    try {
      setLoading(true);

      // 세션에서 사용자 정보를 가져옴
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error("Error fetching session: " + sessionError.message);
      }

      let userId = null;

      // 로그인된 사용자 ID 추출
      if (session && session.user) {
        userId = session.user.id;
      }

      let query = supabase
        .from("saved_builds")
        .select("builds:build_id(*), uid")
        .order("created_at", { ascending: false }) // 최신순으로 정렬
        .range(
          (pageNumber - 1) * buildsPerPage,
          pageNumber * buildsPerPage - 1
        ); // 페이지 범위 지정 (24개씩)

      // 로그인된 사용자의 빌드를 제외하는 조건 추가
      if (userId !== null) {
        query = query.neq("uid", userId); // 로그인한 사용자의 빌드를 제외
      }

      const { data: buildsData, error: buildsError } = await query;

      if (buildsError) {
        throw new Error("Error fetching builds: " + buildsError.message);
      }

      if (!buildsData.length) {
        setLoading(false);
        return;
      }

      // 다음 페이지 데이터 확인을 위한 추가 요청 (다음 페이지 데이터가 있는지 확인)
      const nextPageQuery = supabase
        .from("saved_builds")
        .select("builds:build_id(*), uid")
        .order("created_at", { ascending: false })
        .range(pageNumber * buildsPerPage, pageNumber * buildsPerPage); // 다음 페이지의 첫 번째 데이터만 확인

      if (userId !== null) {
        nextPageQuery.neq("uid", userId);
      }

      const { data: nextPageData } = await nextPageQuery;
      setHasNextPage(nextPageData && nextPageData.length > 0);

      // saved_builds 테이블의 데이터를 builds 테이블 형식으로 변환 및 날짜 변환
      const builds = buildsData.map((entry) => {
        const build = entry.builds;
        const createdAt = new Date(build.created_at);
        const formattedDate = `${createdAt.getFullYear()}.${(
          createdAt.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}.${createdAt
          .getDate()
          .toString()
          .padStart(2, "0")}`;
        return { ...build, creationDate: formattedDate };
      });

      // 이전 데이터를 유지하지 않고 새로운 데이터를 세팅
      setBuilds(builds);

      // visibleCards를 초기화하고 애니메이션 시작
      setVisibleCards(new Array(builds.length).fill(false));

      // 지연을 주면서 하나씩 카드를 표시
      builds.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards((prev) => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * 100); // 카드가 100ms 간격으로 나타나도록 설정
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching builds:", error.message);
    }
  };

  // 제품 가격 정보를 조회하는 함수
  const fetchProductPrices = async (buildsData: any[]) => {
    const productNames = buildsData
      .flatMap((build) => [
        build.Case,
        build.Cooler,
        build.CPU,
        build.HDD,
        build.MBoard,
        build.Power,
        build.RAM,
        build.SSD,
        build.VGA,
      ])
      .filter((part) => part !== null);

    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("product_name, price")
      .in("product_name", productNames);

    if (productsError || !productsData) {
      throw new Error(
        "Error fetching product prices: " + productsError.message
      );
    }

    return productsData.reduce((acc, product) => {
      acc[product.product_name] = product.price;
      return acc;
    }, {});
  };

  // 빌드의 가격을 계산하는 함수
  const calculateBuildPrice = (
    build,
    productPriceMap: { [x: string]: any }
  ) => {
    const totalPrice = [
      build.Case,
      build.Cooler,
      build.CPU,
      build.HDD,
      build.MBoard,
      build.Power,
      build.RAM,
      build.SSD,
      build.VGA,
    ].reduce((sum, part) => sum + (productPriceMap[part] || 0), 0);

    return { ...build, totalPrice };
  };

  // 상세 정보를 클릭했을 때 빌드 상세 정보를 가져오는 함수
  const handleBuildClick = async (buildId: any) => {
    try {
      setLoading(true);
      console.log("Fetching details for buildId:", buildId); // 로그 추가
      // 선택된 빌드의 상세 정보를 가져옴
      const { data: buildDetails, error: buildDetailsError } = await supabase
        .from("builds")
        .select("*")
        .eq("id", buildId)
        .single();

      if (buildDetailsError) {
        throw new Error(
          "Error fetching build details: " + buildDetailsError.message
        );
      }

      console.log("Build details fetched:", buildDetails); // 로그 추가

      const productsData = await fetchProductPrices([buildDetails]);
      const buildWithPrices = calculateBuildPrice(buildDetails, productsData);

      setSelectedBuild(buildWithPrices); // 선택된 빌드 설정
      setSelectedBuildPriceMap(productsData); // 가격 정보 저장
      setLoading(false);
      console.log("Selected build:", buildWithPrices); // 로그 추가
    } catch (error) {
      setLoading(false);
      console.error("Error fetching build details:", error.message);
    }
  };

  useEffect(() => {
    // activeTab이 "Community Builds"로 변경되고 tabChange.current가 true일 때만 fetchBuilds 실행
    if (activeTab === "Community Builds" && tabChange.current) {
      fetchBuilds(page);
      tabChange.current = false; // 실행 후 한번만 실행되도록 변경
    } else if (activeTab !== "Community Builds" && !tabChange.current) {
      tabChange.current = true; // activeTab이 다른 탭으로 변경되면 다시 true로 변경
    }
  }, [activeTab, page]);

  const nextPage = () => {
    if (hasNextPage) {
      tabChange.current = true; //
      setPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      tabChange.current = true; //
      setPage((prev) => prev - 1);
    }
  };

  const textThemeStyle = theme === "dark" ? "text-white" : "text-black"; // dark 모드일 때 흰색, 아니면 검은색
  const backgroundThemeStyle = theme === "dark" ? "bg-[#0d1117]" : "bg-white";
  const blockedPanelBuildedStyle = loading
    ? "opacity-100 pointer-events-auto "
    : "opacity-0 pointer-events-none ";
  const panelThemeStyle = theme === "dark" ? "bg-[#0d1117]" : "bg-white";
  const borderColorThemeStyle =
    theme === "dark" ? "border-gray-300" : "border-[#0d1117]";

  const priceRangeTotalStyle = `${backgroundThemeStyle} ${textThemeStyle} border border-white rounded-xl w-20 flex justify-center items-center`;

  return (
    <div className="relative w-full h-full pb-[4%] mt-[-4%]">
      <div className="mb-3 flex flex-row">
        <ul className="flex flex-row text-white gap-2">
          <li className={`${priceRangeTotalStyle}`}>
            <button>All</button> {/**/}
          </li>
          <li className={`${priceRangeTotalStyle}`}>
            <button>사무용</button> {/**/}
          </li>
          <li>
            <button>저사양</button> {/**/}
          </li>
          <li>
            <button>보급형</button> {/**/}
          </li>
          <li>
            <button>고사양</button> {/**/}
          </li>
          <li>
            <button>하이엔드</button> {/**/}
          </li>
        </ul>

        <ul className="flex flex-row text-white gap-2">
          <li className={`${priceRangeTotalStyle}`}>
            <button>사무용</button> {/**/}
          </li>
          <li className={`${priceRangeTotalStyle}`}>
            <button>사무용</button> {/**/}
          </li>
          <li>
            <button>저사양</button> {/**/}
          </li>
          <li>
            <button>보급형</button> {/**/}
          </li>
          <li>
            <button>고사양</button> {/**/}
          </li>
          <li>
            <button>하이엔드</button> {/**/}
          </li>
        </ul>
      </div>
      <section
        className={`${backgroundThemeStyle} ${borderColorThemeStyle} relative h-full border-t border-b py-4 bg-opacity-30 px-2`}
      >
        <div className="w-full h-full overflow-hidden max-h-[100%]">
          <div
            className={`${blockedPanelBuildedStyle} ${panelThemeStyle} absolute flex justify-center items-center h-full inset-0 bg-opacity-50 z-40 text-6xl`}
          >
            <span className={`${textThemeStyle}`}>Loading...</span>
          </div>
          {/* BuildDetailsPanel */}
          {selectedBuild && (
            <BuildDetailsPanel
              selectedBuild={selectedBuild}
              productPriceMap={selectedBuildPriceMap} // 가격 정보 전달
              theme={theme}
              onClose={() => setSelectedBuild(null)} // 패널 닫기 기능
            />
          )}

          <div className="grid grid-cols-4 gap-4 overflow-y-scroll max-h-[100%] pr-2">
            {builds.map((build, index) => (
              <div
                key={build.id}
                className={`transition-all duration-500 ease-out transform ${
                  visibleCards[index]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
              >
                <BuildCard
                  build={build}
                  theme={theme}
                  creationDate={build.creationDate} // 생성 날짜 전달
                  onClick={() => handleBuildClick(build.id)} // 클릭 시 handleBuildClick 호출
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <nav className="flex justify-between mt-4 w-[20%] mx-auto">
        <button
          onClick={prevPage}
          className="px-4 py-2 bg-gray-200 rounded-lg"
          disabled={page === 1}
        >
          {"<"}
        </button>
        <span
          className={`${textThemeStyle} w-3 flex justify-center items-center`}
        >
          {page}
        </span>
        <button
          onClick={nextPage}
          className="px-4 py-2 bg-gray-200 rounded-lg"
          disabled={!hasNextPage}
        >
          {">"}
        </button>
      </nav>
    </div>
  );
};

export default CommunityBuilds;
