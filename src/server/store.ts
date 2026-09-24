import type { Balance } from "@/types/balances";

export const balances: Balance[] = [
  { currency: "NGN", amount: "125000050" },
  { currency: "USD", amount: "250075" },
  { currency: "GBP", amount: "0" },
  { currency: "EUR", amount: "48020" },
  { currency: "JPY", amount: "150000" },
];

export const debugFlags = {
  forceRatesOutage: false,
  forceNextQuoteExpired: false,
};
