export const CURRENCIES = ["NGN", "USD", "GBP", "EUR", "JPY"] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

export const DECIMAL_PLACES: Record<CurrencyCode, number> = {
  NGN: 2,
  USD: 2,
  GBP: 2,
  EUR: 2,
  JPY: 0,
};

export const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  NGN: "Nigerian naira",
  USD: "US dollar",
  GBP: "British pound",
  EUR: "Euro",
  JPY: "Japanese yen",
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  JPY: "¥",
};
