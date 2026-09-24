import type { CurrencyCode } from "@/constants/currencies";

export type RatesResponse = {
  base: CurrencyCode;
  rates: Partial<Record<CurrencyCode, string>>;
  timestamp: string;
  previousRates?: Partial<Record<CurrencyCode, string>>;
};
