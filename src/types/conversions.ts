import type { CurrencyCode } from "@/constants/currencies";
import type { MoneyAmount } from "@/types/currency";

export type CreateConversionRequest = {
  quoteId: string;
  idempotencyKey: string;
};

export type Conversion = {
  id: string;
  quoteId: string;
  status: "completed";
  sellCurrency: CurrencyCode;
  sellAmount: string;
  buyCurrency: CurrencyCode;
  buyAmount: string;
  rate: string;
  fee: MoneyAmount;
  createdAt: string;
};

export type ConversionsResponse = {
  conversions: Conversion[];
};
