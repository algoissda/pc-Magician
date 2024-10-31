import { Build } from "../../types/build.type";

export type CalculatedBuildDetails = Build & {
  totalPrice: number;
  partExplanations: Record<string, string>;
};

// 빌드의 가격을 계산하는 함수
export const calculateBuildDetails = (
  build: Build,
  productPriceMap: { [x: string]: number },
  productExplanationMap: { [x: string]: string | null }
): CalculatedBuildDetails => {
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
  ].reduce(
    (sum, part) => sum + (part ? Number(productPriceMap[part] || 0) : 0),
    0
  );

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
  ].reduce((acc: Record<string, string>, part) => {
    if (part) {
      acc[part] = productExplanationMap[part] || "No explanation available.";
    }
    return acc;
  }, {});

  return { ...build, totalPrice, partExplanations };
};
