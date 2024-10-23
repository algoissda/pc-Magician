"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { useActiveStore } from "@/store/useActiveTab";
import { useThemeStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { supabase } from "../../../../../../supabase/client";
import {
  BuildCard,
  BuildDetailsPanel,
} from "../../_components/main_functions/community_builds/CommunityBuilds/asdf";

const CommunityBuilds = () => {
  const [builds, setBuilds] = useState<any[]>([]);
  const [selectedBuild, setSelectedBuild] = useState<any | null>(null);

  const theme = useThemeStore((state) => state.theme);
  const activeTab = useActiveStore((state) => state.activeTab);

  const fetchBuilds = async () => {
    try {
      // 사용자 정보를 가져와서 userId 추출
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      let userId = null;

      if (!userError && userData?.user) {
        userId = userData.user.id;
      }

      let buildsData;
      let buildsError;

      if (userId) {
        // 로그인한 사용자의 빌드 정보를 가져옴
        const response = await supabase
          .from("saved_builds")
          .select(`builds:build_id(*), uid`)
          .eq("uid", userId); // 로그인한 사용자의 빌드만 가져옴

        buildsData = response.data;
        buildsError = response.error;
      }

      if (buildsError) {
        throw new Error("Error fetching builds: " + buildsError.message);
      }

      if (!buildsData?.length) {
        return;
      }

      console.log("User ID:", userId);
      console.log("Builds Data:", buildsData);
      console.log("Builds Error:", buildsError);

      // products 테이블에서 필요한 부품 가격 정보를 조회
      const builds = buildsData.map((entry) => entry.builds); // 조인된 빌드 정보만 추출
      const products = await fetchProductPrices(builds); // 부품 가격 조회
      const buildsWithPrices = builds.map((build) =>
        calculateBuildPrice(build, products)
      );

      setBuilds(buildsWithPrices); // 빌드 상태 업데이트
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
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchBuilds();
  }, [activeTab, fetchBuilds]);

  console.log("builds", builds);

  return (
    <main className="relative w-full h-full pb-8">
      <section className="relative h-full border-t border-b border-gray-300 py-4 bg-gray-600 bg-opacity-30 px-2">
        <div className="w-full h-full overflow-hidden max-h-[100%]">
          {/* <div className="p-4 m-2 w-full max-w-xs flex flex-col justify-between border rounded-2xl custom-border">
          {/* RGB 색상을 만들기 위해 커스텀 보더를 따로 만들었음 */}
          {/* <style jsx>{`
            .custom-border {
              border-width: 4px;
              border-image: linear-gradient(260deg, violet, skyblue, white) 1;
            }
          `}</style> */}
          <BuildDetailsPanel
            selectedBuild={selectedBuild}
            theme={theme}
            onClose={() => setSelectedBuild(null)}
          />
          <div className="grid grid-cols-4 gap-4 overflow-y-scroll max-h-[100%]">
            {builds.map((build) => (
              <>
                <BuildCard
                  key={build.id}
                  build={build}
                  theme={theme}
                  onClick={() => fetchBuildDetails(build.id)}
                />
                <div className="text-white">{build.id};</div>
              </>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default CommunityBuilds;
