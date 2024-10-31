import { Tables } from "../supabase/database.types";

export type Build = Tables<"builds">;

export type BuildWithCreationDate = Build & {
  creationDate: string;
};

export type BuildWithCreationDateAndTotalPrice = Build & {
  creationDate: string;
  totalPrice: number;
};

// export interface Build {
//   id: number;
//   Case: string | null;
//   Cooler: string | null;
//   CPU: string | null;
//   HDD: string | null;
//   MBoard: string | null;
//   Power: string | null;
//   RAM: string | null;
//   SSD: string | null;
//   VGA: string | null;
//   total_price?: number | null;
//   created_at?: string;
//   creationDate?: string;
// }
