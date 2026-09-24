export const CURRENCIES = ["NGN", "USD", "GBP", "EUR", "JPY"] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

export const DECIMAL_PLACES: Record<CurrencyCode, number> = {
  NGN: 2,
  USD: 2,
  GBP: 2,
  EUR: 2,
  JPY: 0,
};
