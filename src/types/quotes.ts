import type { CurrencyCode } from "@/constants/currencies";
import type { MoneyAmount } from "@/types/currency";

export type CreateQuoteRequest = {
  sellCurrency: CurrencyCode;
  buyCurrency: CurrencyCode;
  sellAmount?: string;
  buyAmount?: string;
};

export type Quote = {
  id: string;
  sellCurrency: CurrencyCode;
  buyCurrency: CurrencyCode;
  sellAmount: string;
  buyAmount: string;
  rate: string;
  fee: MoneyAmount;
  expiresAt: string;
  serverTime: string;
};
