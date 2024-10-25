"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { useActiveStore } from "@/store/useActiveTab";
import { useThemeStore } from "@/store/useStore";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../../../../../supabase/client";
import { BuildCard } from "./CommunityBuildsComponents/BuildCard";
import { BuildDetailsPanel } from "./CommunityBuildsComponents/BuildDetailsPanel";
import { SelectBox } from "./CommunityBuildsComponents/SelectBox";

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
  const [minPrice, setMinPrice] = useState<number | null>(null); // 최소 가격
  const [maxPrice, setMaxPrice] = useState<number | null>(null); // 최대 가격
  const [selectedCategory, setSelectedCategory] = useState<string>("All"); // 선택된 카테고리 필터
  const [sortBy, setSortBy] = useState<string>("최근견적순"); // 정렬 기준
  const buildsPerPage = 24; // 한 페이지에 표시할 빌드 수
  const theme = useThemeStore((state) => state.theme);
  const activeTab = useActiveStore((state) => state.activeTab);

  const tabChange = useRef(true); // useRef로 tabChange 상태 관리

  // 빌드를 가져오는 함수
  const fetchBuilds = async (pageNumber: number) => {
    try {
      setLoading(true);

      let query = supabase
        .from("saved_builds")
        .select("builds(*), uid")
        .range(
          (pageNumber - 1) * buildsPerPage,
          pageNumber * buildsPerPage - 1
        );

      // 가격 필터 적용
      switch (selectedCategory) {
        case "사무용":
          query = query.lte("builds.total_price", 70 * 10000);
          break;
        case "저사양":
          query = query.gte("builds.total_price", 70 * 10000);
          query = query.lte("builds.total_price", 100 * 10000);
          break;
        case "보급형":
          query = query.gte("builds.total_price", 100 * 10000);
          query = query.lte("builds.total_price", 200 * 10000);
          break;
        case "고사양":
          query = query.gte("builds.total_price", 200 * 10000);
          query = query.lte("builds.total_price", 400 * 10000);
          break;
        case "하이엔드":
          query = query.gte("builds.total_price", 400 * 10000);
          break;
      }

      // 가격 필터 적용
      if (minPrice !== null) {
        query = query.gte("builds.total_price", minPrice * 10000); // 최소 가격 필터
      }
      if (maxPrice !== null) {
        query = query.lte("builds.total_price", maxPrice * 10000); // 최대 가격 필터
      }

      const { data: buildsData, error: buildsError } = await query;

      if (buildsError) {
        console.error("Error fetching builds:", buildsError.message);
        setLoading(false);
        return;
      }

      if (!buildsData || buildsData.length === 0) {
        console.log("No builds found.");
        setLoading(false);
        return;
      }

      // 클라이언트 측에서 정렬 적용 (낮은가격순, 높은가격순, 생성일 순)
      if (sortBy === "낮은가격순") {
        buildsData.sort(
          (a, b) => a.builds?.total_price - b.builds?.total_price
        );
      } else if (sortBy === "높은가격순") {
        buildsData.sort(
          (a, b) => b.builds?.total_price - a.builds?.total_price
        );
      } else {
        buildsData.sort((a, b) => {
          // created_at 필드가 null인지 확인 후 비교
          const dateA = a.builds?.created_at
            ? new Date(a.builds.created_at).getTime()
            : 0;
          const dateB = b.builds?.created_at
            ? new Date(b.builds.created_at).getTime()
            : 0;
          return dateB - dateA; // 최신순으로 정렬
        });
      }

      // 다음 페이지 데이터 확인을 위한 추가 요청 (다음 페이지 데이터가 있는지 확인)
      const nextPageQuery = supabase
        .from("saved_builds")
        .select("builds:build_id(*), uid")
        .range(pageNumber * buildsPerPage, pageNumber * buildsPerPage);

      const { data: nextPageData } = await nextPageQuery;
      setHasNextPage(nextPageData && nextPageData.length > 0);

      // saved_builds 테이블의 데이터를 builds 테이블 형식으로 변환 및 날짜 변환
      const builds = buildsData
        .map((entry) => {
          const build = entry.builds;
          if (!build) return null; // build가 없는 경우 null 처리

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
        })
        .filter((build) => build !== null); // null 값 필터링

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
      console.error("Error fetching builds:", error.message);
      setLoading(false);
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

  // 가격 범위와 카테고리 필터 적용 함수
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setPage(1); // 페이지를 1로 초기화
  };

  useEffect(() => {
    fetchBuilds(page); // 페이지, 필터, 가격 등이 변경될 때 빌드를 가져옴
  }, [page, minPrice, maxPrice, selectedCategory, sortBy]);

  const handlePriceRangeSearch = () => {
    // 페이지를 1로 초기화하고 useEffect에서 자동으로 빌드를 가져오도록 설정
    setPage(1);
  };

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
  const selectTextThemeStyle = theme === "dark" ? "text-black" : "text-white"; // 위에거 반대

  const backgroundThemeStyle = theme === "dark" ? "bg-[#0d1117]" : "bg-white";
  const selectBackgroundThemeStyle =
    theme === "dark" ? "bg-white" : "bg-[#0d1117]"; // 위에거 반대

  const blockedPanelBuildedStyle = loading
    ? "opacity-100 pointer-events-auto "
    : "opacity-0 pointer-events-none ";
  const borderColorThemeStyle =
    theme === "dark" ? "border-gray-300" : "border-[#0d1117]";

  const priceRangeTotalStyle = `${backgroundThemeStyle} ${textThemeStyle} max-w-32 h-8 border border-white rounded-xl px-2 flex justify-center items-center`;
  const selectPriceRangeTotalStyle = `${selectBackgroundThemeStyle} ${selectTextThemeStyle} max-w-32 h-8 border border-black rounded-xl px-2 flex justify-center items-center`;

  return (
    <div className="relative w-full h-full pb-[4%] mt-[-4%]">
      <div className="mb-3 flex flex-row justify-between">
        <ul className="flex flex-row gap-2">
          {/*이ul안에 있는 것들은 실시간으로 적용 하기*/}
          <button
            className={`${
              selectedCategory !== "All"
                ? priceRangeTotalStyle
                : selectPriceRangeTotalStyle
            }`}
            onClick={() => handleCategorySelect("All")}
          >
            All {/*모두 조회*/}
          </button>
          <button
            className={`${
              selectedCategory !== "사무용"
                ? priceRangeTotalStyle
                : selectPriceRangeTotalStyle
            }`}
            onClick={() => handleCategorySelect("사무용")}
          >
            사무용 {/*70만원 이하*/}
          </button>
          <button
            className={`${
              selectedCategory !== "저사양"
                ? priceRangeTotalStyle
                : selectPriceRangeTotalStyle
            }`}
            onClick={() => handleCategorySelect("저사양")}
          >
            저사양 {/*70만원 초과 100만원 이하*/}
          </button>
          <button
            className={`${
              selectedCategory !== "보급형"
                ? priceRangeTotalStyle
                : selectPriceRangeTotalStyle
            }`}
            onClick={() => handleCategorySelect("보급형")}
          >
            보급형 {/*100만원 초과 200만원 이하*/}
          </button>
          <button
            className={`${
              selectedCategory !== "고사양"
                ? priceRangeTotalStyle
                : selectPriceRangeTotalStyle
            }`}
            onClick={() => handleCategorySelect("고사양")}
          >
            고사양 {/*200만원 초과 400만원 이하*/}
          </button>
          <button
            className={`${
              selectedCategory !== "하이엔드"
                ? priceRangeTotalStyle
                : selectPriceRangeTotalStyle
            }`}
            onClick={() => handleCategorySelect("하이엔드")}
          >
            하이엔드 {/*400만원 초과*/}
          </button>
        </ul>

        <ul className="flex flex-row text-white gap-2">
          {/*이 ul안에 있는 것들은 조회버튼을 눌러야 조회*/}
          <SelectBox
            id="sortBy"
            label="정렬기준┃"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={["최근견적순", "낮은가격순", "높은가격순"]}
            theme={theme}
          />
          <li className="flex justify-center items-center">
            <input
              className={`${priceRangeTotalStyle}`}
              type="number"
              placeholder="최소"
              value={minPrice !== null ? minPrice : ""}
              onChange={(e) =>
                setMinPrice(e.target.value ? Number(e.target.value) : null)
              }
            />
            만원
          </li>
          ~
          <li className="flex justify-center items-center">
            <input
              className={`${priceRangeTotalStyle}`}
              type="number"
              placeholder="최대"
              value={maxPrice !== null ? maxPrice : ""}
              onChange={(e) =>
                setMaxPrice(e.target.value ? Number(e.target.value) : null)
              }
            />
            만원
          </li>
        </ul>
      </div>
      <section
        className={`${backgroundThemeStyle} ${borderColorThemeStyle} relative h-full border-t border-b py-4 bg-opacity-30 px-2`}
      >
        <div className="w-full h-full overflow-hidden max-h-[100%]">
          <div
            className={`${blockedPanelBuildedStyle} ${backgroundThemeStyle} absolute flex justify-center items-center h-full inset-0 bg-opacity-50 z-40 text-6xl`}
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
