import type { CurrencyCode } from "@/constants/currencies";

export const queryKeys = {
  balances: ["balances"] as const,
  rates: (base: CurrencyCode) => ["rates", base] as const,
  conversions: ["conversions"] as const,
};
