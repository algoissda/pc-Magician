"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import { useActiveStore } from "@/store/useActiveTab";
import { useThemeStore } from "@/store/useStore";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../../../../../supabase/client";
import { BuildCard } from "./CommunityBuildsComponents/BuildCard";
import { BuildDetailsPanel } from "./CommunityBuildsComponents/BuildDetailsPanel";
import { SelectBox } from "./CommunityBuildsComponents/SelectBox";
import page from "../QuestionAnswer/page";

const CommunityBuilds = () => {
  const [builds, setBuilds] = useState<any[]>([]);
  const [selectedBuild, setSelectedBuild] = useState<any | null>(null); // 선택된 빌드를 저장
  const [selectedBuildPriceMap, setSelectedBuildPriceMap] = useState<
    any | null
  >(null); // 가격 정보 저장
  const [selectedBuildExplanations, setSelectedBuildExplanations] = useState<
    any | null
  >(null); // 부품 설명 정보 저장
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

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      let userId: string | null = null;
      if (!userError && userData?.user) {
        userId = userData.user.id;
      }

      let savedBuildIds: string[] = [];

      if (userId) {
        const { data: userSavedBuilds, error: savedBuildsError } =
          await supabase
            .from("saved_builds")
            .select("build_id")
            .eq("uid", userId);

        if (savedBuildsError) {
          setLoading(false);
          return;
        }

        savedBuildIds = userSavedBuilds
          ? userSavedBuilds.map((item) => item.build_id)
          : [];
      }

      let query = supabase
        .from("saved_builds")
        .select("builds(*), uid")
        .range(
          (pageNumber - 1) * buildsPerPage,
          pageNumber * buildsPerPage - 1
        );

      if (userId) {
        query = query
          .neq("uid", userId)
          .not("build_id", "in", `(${savedBuildIds.join(",")})`);
      }

      switch (selectedCategory) {
        case "사무용":
          query = query.lte("builds.total_price", 70 * 10000);
          break;
        case "저사양":
          query = query
            .gte("builds.total_price", 70 * 10000)
            .lte("builds.total_price", 100 * 10000);
          break;
        case "보급형":
          query = query
            .gte("builds.total_price", 100 * 10000)
            .lte("builds.total_price", 200 * 10000);
          break;
        case "고사양":
          query = query
            .gte("builds.total_price", 200 * 10000)
            .lte("builds.total_price", 400 * 10000);
          break;
        case "하이엔드":
          query = query.gte("builds.total_price", 400 * 10000);
          break;
      }

      if (minPrice !== null)
        query = query.gte("builds.total_price", minPrice * 10000);
      if (maxPrice !== null)
        query = query.lte("builds.total_price", maxPrice * 10000);

      const { data: buildsData, error: buildsError } = await query;
      if (buildsError) {
        setLoading(false);
        return;
      }

      if (!buildsData || buildsData.length === 0) {
        setLoading(false);
        return;
      }

      // 중복 제거
      const uniqueBuilds = Array.from(
        new Map(
          buildsData.map((entry) => [entry.builds.id, entry.builds])
        ).values()
      );

      if (sortBy === "낮은가격순") {
        uniqueBuilds.sort((a, b) => a.total_price - b.total_price);
      } else if (sortBy === "높은가격순") {
        uniqueBuilds.sort((a, b) => b.total_price - a.total_price);
      } else {
        uniqueBuilds.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
      }

      const nextPageQuery = supabase
        .from("saved_builds")
        .select("builds:build_id(*), uid")
        .range(pageNumber * buildsPerPage, pageNumber * buildsPerPage);

      const { data: nextPageData } = await nextPageQuery;
      setHasNextPage(nextPageData && nextPageData.length > 0);

      const builds = uniqueBuilds
        .map((build) => {
          if (!build) return null;
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
        .filter((build) => build !== null);

      setBuilds(builds);
      setVisibleCards(new Array(builds.length).fill(false));

      builds.forEach((_, index) => {
        setTimeout(() => {
          setVisibleCards((prev) => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * 100);
      });

      setLoading(false);
    } catch (error) {
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
      .select("product_name, price, explanation") // 설명을 포함하여 불러옴
      .in("product_name", productNames);

    if (productsError || !productsData) {
      throw new Error(
        "Error fetching product prices: " + productsError.message
      );
    }

    const priceMap = productsData.reduce((acc, product) => {
      acc[product.product_name] = product.price;
      return acc;
    }, {});

    const explanationMap = productsData.reduce((acc, product) => {
      acc[product.product_name] = product.explanation;
      return acc;
    }, {});

    return { priceMap, explanationMap };
  };

  // 빌드의 가격 및 부품 설명을 계산하는 함수
  const calculateBuildDetails = (
    build,
    productPriceMap: { [x: string]: any },
    productExplanationMap: { [x: string]: any }
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

    const partExplanations = [
      build.Case,
      build.Cooler,
      build.CPU,
      build.HDD,
      build.MBoard,
      build.Power,
      build.RAM,
      build.SSD,
      build.VGA,
    ].reduce((acc, part) => {
      acc[part] = productExplanationMap[part] || "No explanation available.";
      return acc;
    }, {});

    return { ...build, totalPrice, partExplanations };
  };

  // 상세 정보를 클릭했을 때 빌드 상세 정보를 가져오는 함수
  const handleBuildClick = async (buildId: any) => {
    try {
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

      const { priceMap, explanationMap } = await fetchProductPrices([
        buildDetails,
      ]);
      const buildWithDetails = calculateBuildDetails(
        buildDetails,
        priceMap,
        explanationMap
      );

      setSelectedBuild(buildWithDetails); // 선택된 빌드 설정
      setSelectedBuildPriceMap(priceMap); // 가격 정보 저장
      setSelectedBuildExplanations(buildWithDetails.partExplanations); // 설명 정보 저장
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (activeTab === "Community Builds" && tabChange.current) {
      fetchBuilds(page);
      tabChange.current = false;
    } else if (activeTab !== "Community Builds" && !tabChange.current) {
      tabChange.current = true;
    }
  }, [activeTab, page]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  useEffect(() => {
    fetchBuilds(page);
  }, [page, minPrice, maxPrice, selectedCategory, sortBy]);

  const handlePriceRangeSearch = () => {
    setPage(1);
  };

  const nextPage = () => {
    if (hasNextPage) {
      tabChange.current = true;
      setPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      tabChange.current = true;
      setPage((prev) => prev - 1);
    }
  };

  const textThemeStyle = theme === "dark" ? "text-white" : "text-black";
  const selectTextThemeStyle = theme === "dark" ? "text-black" : "text-white";
  const backgroundThemeStyle = theme === "dark" ? "bg-[#0D1117]" : "bg-white";
  const selectBackgroundThemeStyle =
    theme === "dark" ? "bg-white" : "bg-[#0D1117]";
  const blockedPanelBuildedStyle = loading
    ? "opacity-100 pointer-events-auto "
    : "opacity-0 pointer-events-none ";
  const borderColorThemeStyle =
    theme === "dark" ? "border-cyan-400" : "border-pink-500";
  const priceRangeTotalStyle = `${backgroundThemeStyle} ${textThemeStyle} max-w-32 h-8 border border-white rounded-xl px-2 flex justify-center items-center`;
  const selectPriceRangeTotalStyle = `${selectBackgroundThemeStyle} ${selectTextThemeStyle} max-w-32 h-8 border border-black rounded-xl px-2 flex justify-center items-center`;

  return (
    <div className="relative w-full h-full pb-[4%] mt-[-4%]">
      <div className="mb-3 flex flex-row justify-between">
        <ul className="flex flex-row gap-2">
          <button
            className={`${
              selectedCategory !== "All"
                ? priceRangeTotalStyle
                : selectPriceRangeTotalStyle
            }`}
            onClick={() => handleCategorySelect("All")}
          >
            All
          </button>
          <button
            className={`${
              selectedCategory !== "사무용"
                ? priceRangeTotalStyle
                : selectPriceRangeTotalStyle
            }`}
            onClick={() => handleCategorySelect("사무용")}
          >
            사무용
          </button>
          <button
            className={`${
              selectedCategory !== "저사양"
                ? priceRangeTotalStyle
                : selectPriceRangeTotalStyle
            }`}
            onClick={() => handleCategorySelect("저사양")}
          >
            저사양
          </button>
          <button
            className={`${
              selectedCategory !== "보급형"
                ? priceRangeTotalStyle
                : selectPriceRangeTotalStyle
            }`}
            onClick={() => handleCategorySelect("보급형")}
          >
            보급형
          </button>
          <button
            className={`${
              selectedCategory !== "고사양"
                ? priceRangeTotalStyle
                : selectPriceRangeTotalStyle
            }`}
            onClick={() => handleCategorySelect("고사양")}
          >
            고사양
          </button>
          <button
            className={`${
              selectedCategory !== "하이엔드"
                ? priceRangeTotalStyle
                : selectPriceRangeTotalStyle
            }`}
            onClick={() => handleCategorySelect("하이엔드")}
          >
            하이엔드
          </button>
        </ul>
        <ul className="flex flex-row text-white gap-2">
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
          {selectedBuild && (
            <BuildDetailsPanel
              selectedBuild={selectedBuild}
              productPriceMap={selectedBuildPriceMap} // 가격 정보 전달
              partExplanations={selectedBuildExplanations} // 부품 설명 전달
              theme={theme}
              onClose={() => setSelectedBuild(null)} // 패널 닫기 기능
            />
          )}
          <div className="grid grid-cols-4 gap-4 overflow-y-scroll max-h-[100%] pr-2">
            {builds.map((build, index) => (
              <div
                key={`${build.id}-${index}`}
                className={`transition-all duration-500 ease-out transform ${
                  visibleCards[index]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
              >
                <BuildCard
                  build={build}
                  theme={theme}
                  creationDate={build.creationDate}
                  onClick={() => handleBuildClick(build.id)}
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
