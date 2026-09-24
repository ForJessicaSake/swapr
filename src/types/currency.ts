import type { CurrencyCode } from "@/constants/currencies";

export type MoneyAmount = {
  currency: CurrencyCode;
  amount: string;
};
