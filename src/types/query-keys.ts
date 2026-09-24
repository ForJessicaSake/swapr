import type { CurrencyCode } from "@/constants/currencies";

export enum QueryKey {
  Balances = "balances",
  Rates = "rates",
  Conversions = "conversions",
}

export const QUERY_KEYS = {
  [QueryKey.Balances]: [QueryKey.Balances] as const,
  [QueryKey.Rates]: (baseCurrency: CurrencyCode) =>
    [QueryKey.Rates, baseCurrency] as const,
  [QueryKey.Conversions]: [QueryKey.Conversions] as const,
};
