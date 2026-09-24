import type { CurrencyCode } from "@/constants/currencies";

export type Money = {
  currency: CurrencyCode;
  amount: string;
};
