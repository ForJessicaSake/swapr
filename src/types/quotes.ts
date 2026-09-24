import type { CurrencyCode } from "@/constants/currencies";
import type { Money } from "@/types/currency";

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
  fee: Money;
  expiresAt: string;
  serverTime: string;
};
