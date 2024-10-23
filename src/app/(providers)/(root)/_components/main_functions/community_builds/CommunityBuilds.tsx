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
  const [selectedBuild, setSelectedBuild] = useState<any | null>(null);
  const [selectedBuildPriceMap, setSelectedBuildPriceMap] = useState<
    any | null
  >(null); // 가격 정보 저장
  const [page, setPage] = useState(1);
  const buildsPerPage = 100;
  const theme = useThemeStore((state) => state.theme);
  const activeTab = useActiveStore((state) => state.activeTab);

  const tabChange = useRef(true); // useRef로 tabChange 상태 관리

  const fetchBuilds = async () => {
    try {
      // 사용자 정보를 가져와서 userId 추출
      const { data: userData, error: userError } =
        await supabase.auth.getSession();
      console.log("user::", userData);
      let userId = null;

      if (!userError && userData?.session?.user.id) {
        userId = userData.session?.user.id;
      }

      // saved_builds와 builds를 조인하여 빌드 데이터를 가져옴 (userId 제외)
      let query = supabase
        .from("saved_builds")
        .select(`builds:build_id(*), uid`);

      if (userId !== null) {
        query = query.neq("uid", userId); // 로그인한 사용자의 빌드를 제외
      }

      const { data: buildsData, error: buildsError } = await query;

      if (buildsError) {
        throw new Error("Error fetching builds: " + buildsError.message);
      }

      if (!buildsData?.length) {
        return;
      }

      // products 테이블에서 필요한 부품 가격 정보를 조회
      const builds = buildsData.map((entry) => entry.builds); // 조인된 빌드 정보만 추출
      const products = await fetchProductPrices(builds); // 부품 가격 조회
      const buildsWithPrices = builds.map((build) =>
        calculateBuildPrice(build, products)
      );

      setBuilds(buildsWithPrices); // 빌드 상태 업데이트
      console.log("1111111111111", builds);
    } catch (error) {
      console.error(error.message);
    }
  };

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

  const calculateBuildPrice = (
    build:
      | {}[]
      | {
          Case: string | null;
          Cooler: string;
          CPU: string;
          created_at: string;
          explanation: string | null;
          HDD: string | null;
          id: number;
          MBoard: string;
          Power: string;
          RAM: string;
          SSD: string | null;
          VGA: string;
        },
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

  const fetchBuildDetails = async (buildId: any) => {
    try {
      const { data: buildDetails, error: buildDetailsError } = await supabase
        .from("builds")
        .select("*")
        .eq("id", buildId)
        .single();
      if (buildDetailsError) throw new Error("Error fetching build details");

      const productsData = await fetchProductPrices([buildDetails]);
      const buildWithPrices = calculateBuildPrice(buildDetails, productsData);

      setSelectedBuild(buildWithPrices);
      setSelectedBuildPriceMap(productsData); // 가격 정보 저장
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    // activeTab이 "Community Builds"로 변경되고 tabChange.current가 true일 때만 fetchBuilds 실행
    if (activeTab === "Community Builds" && tabChange.current) {
      fetchBuilds();
      tabChange.current = false; // 실행 후 한번만 실행되도록 변경
    } else if (activeTab !== "Community Builds" && !tabChange.current) {
      tabChange.current = true; // activeTab이 다른 탭으로 변경되면 다시 true로 변경
    }
  }, [activeTab]);

  const nextPage = () => setPage((prev) => prev + 1);
  const prevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="relative w-full h-full pb-8">
      <section className="relative h-full border-t border-b border-gray-300 py-4 bg-gray-600 bg-opacity-30 px-2">
        <div className="w-full h-full overflow-hidden max-h-[100%]">
          <BuildDetailsPanel
            selectedBuild={selectedBuild}
            productPriceMap={selectedBuildPriceMap} // 가격 정보 전달
            theme={theme}
            onClose={() => setSelectedBuild(null)}
          />
          <div className="grid grid-cols-4 gap-4 overflow-y-scroll max-h-[100%]">
            {builds
              .slice((page - 1) * buildsPerPage, page * buildsPerPage)
              .map((build) => (
                <BuildCard
                  key={build.id}
                  build={build}
                  theme={theme}
                  onClick={() => fetchBuildDetails(build.id)}
                />
              ))}
          </div>
        </div>
      </section>
      <nav className="flex justify-center mt-4">
        <button
          onClick={prevPage}
          className="px-4 py-2 bg-gray-200 rounded-l-lg"
        >
          이전 페이지
        </button>
        <button
          onClick={nextPage}
          className="px-4 py-2 bg-gray-200 rounded-r-lg"
        >
          다음 페이지
        </button>
      </nav>
    </div>
  );
};

export default CommunityBuilds;
