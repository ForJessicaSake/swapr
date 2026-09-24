import type { CurrencyCode } from "@/constants/currencies";

export type Balance = {
  currency: CurrencyCode;
  amount: string;
};

export type BalancesResponse = {
  balances: Balance[];
};
