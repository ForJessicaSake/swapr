import type { BalancesResponse } from "@/types/balances";
import type { CurrencyCode } from "@/constants/currencies";
import { RATE_POLL_INTERVAL_MS } from "@/constants/timings";
import type { ConversionsResponse } from "@/types/conversions";
import type { RatesResponse } from "@/types/rates";

export const DEMO_BALANCES: BalancesResponse = {
  balances: [
    { currency: "NGN", amount: "125000050" },
    { currency: "USD", amount: "250075" },
    { currency: "GBP", amount: "0" },
    { currency: "EUR", amount: "48020" },
    { currency: "JPY", amount: "150000" },
  ],
};

const USD_MID_MARKET_RATES: Record<Exclude<CurrencyCode, "USD">, string> = {
  NGN: "1532.45120000",
  GBP: "0.74210000",
  EUR: "0.85430000",
  JPY: "147.82000000",
};

function driftMidMarketRate(
  midMarketRate: string,
  pairSeed: number,
  tick: number,
): string {
  const [whole = "0", fraction = ""] = midMarketRate.split(".");
  const scaled = BigInt(whole + fraction.padEnd(8, "0").slice(0, 8));
  const isUnchanged = (tick + pairSeed) % 3 === 0;
  const basisPoints = isUnchanged
    ? 0
    : Math.round(Math.sin(tick * 0.9 + pairSeed) * 22);
  const drifted = (scaled * BigInt(10_000 + basisPoints)) / 10_000n;
  const digits = drifted.toString().padStart(9, "0");
  return `${digits.slice(0, -8)}.${digits.slice(-8)}`;
}

function buildRatesAt(
  baseCurrency: CurrencyCode,
  atMs: number,
): RatesResponse["rates"] {
  const tick = Math.floor(atMs / RATE_POLL_INTERVAL_MS);
  const rates: RatesResponse["rates"] = {};

  for (const [currency, usdRate] of Object.entries(USD_MID_MARKET_RATES) as Array<
    [Exclude<CurrencyCode, "USD">, string]
  >) {
    if (currency === baseCurrency) continue;
    const liveUsdRate = driftMidMarketRate(
      usdRate,
      currency.charCodeAt(0),
      tick,
    );
    if (baseCurrency === "USD") {
      rates[currency] = liveUsdRate;
      continue;
    }

    const baseInUsd = driftMidMarketRate(
      USD_MID_MARKET_RATES[baseCurrency],
      baseCurrency.charCodeAt(0),
      tick,
    );
    rates[currency] = (Number(liveUsdRate) / Number(baseInUsd)).toFixed(8);
  }

  if (baseCurrency !== "USD") {
    const baseInUsd = driftMidMarketRate(
      USD_MID_MARKET_RATES[baseCurrency],
      baseCurrency.charCodeAt(0),
      tick,
    );
    rates.USD = (1 / Number(baseInUsd)).toFixed(8);
  }

  return rates;
}

export function getDemoExchangeRates(
  baseCurrency: CurrencyCode,
  atMs = Date.now(),
): RatesResponse {
  return {
    base: baseCurrency,
    rates: buildRatesAt(baseCurrency, atMs),
    previousRates: buildRatesAt(baseCurrency, atMs - RATE_POLL_INTERVAL_MS),
    timestamp: new Date(atMs).toISOString(),
  };
}

export const DEMO_CONVERSIONS: ConversionsResponse = {
  conversions: [],
};
