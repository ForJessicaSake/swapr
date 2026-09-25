import { CURRENCIES, type CurrencyCode } from "@/constants/currencies";
import { decimalToScaled } from "@/utils/money";
import type { Balance } from "@/types/balances";
import type { Conversion } from "@/types/conversions";
import type { Quote } from "@/types/quotes";

export const INITIAL_BALANCES: Balance[] = [
  { currency: "NGN", amount: "125000050" },
  { currency: "USD", amount: "250075" },
  { currency: "GBP", amount: "0" },
  { currency: "EUR", amount: "48020" },
  { currency: "JPY", amount: "150000" },
];

const INITIAL_USD_RATES: Record<Exclude<CurrencyCode, "USD">, bigint> = {
  NGN: decimalToScaled("1532.45120000"),
  GBP: decimalToScaled("0.74210000"),
  EUR: decimalToScaled("0.85430000"),
  JPY: decimalToScaled("147.82000000"),
};

export const balances: Balance[] = INITIAL_BALANCES.map((balance) => ({
  ...balance,
}));

export const usdRates: Record<Exclude<CurrencyCode, "USD">, bigint> = {
  ...INITIAL_USD_RATES,
};

export const quotes = new Map<string, Quote>();
export const consumedQuoteIds = new Set<string>();
export const conversions: Conversion[] = [];
export const idempotencyResults = new Map<string, Conversion>();

export const debugFlags = {
  forceRatesOutage: false,
  forceNextQuoteExpired: false,
};

let storeLock: Promise<void> = Promise.resolve();

export async function withStoreLock<T>(fn: () => T): Promise<T> {
  const previous = storeLock;
  let release: () => void = () => undefined;
  storeLock = new Promise((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    return fn();
  } finally {
    release();
  }
}

export function resetStore() {
  balances.splice(
    0,
    balances.length,
    ...INITIAL_BALANCES.map((balance) => ({ ...balance })),
  );
  for (const currency of CURRENCIES) {
    if (currency === "USD") continue;
    usdRates[currency] = INITIAL_USD_RATES[currency];
  }
  quotes.clear();
  consumedQuoteIds.clear();
  conversions.splice(0);
  idempotencyResults.clear();
  debugFlags.forceRatesOutage = false;
  debugFlags.forceNextQuoteExpired = false;
}

export function getBalance(currency: CurrencyCode): bigint {
  const balance = balances.find((entry) => entry.currency === currency);
  return BigInt(balance?.amount ?? "0");
}

export function setBalance(currency: CurrencyCode, amount: bigint) {
  const balance = balances.find((entry) => entry.currency === currency);
  if (!balance) {
    balances.push({ currency, amount: amount.toString() });
    return;
  }
  balance.amount = amount.toString();
}
