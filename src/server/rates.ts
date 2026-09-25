import { CURRENCIES, type CurrencyCode } from "@/constants/currencies";
import { debugFlags, usdRates } from "@/server/store";
import type { RatesResponse } from "@/types/rates";
import { scaledToDecimal } from "@/utils/money";

const RATE_SCALE = 100_000_000n;

function unitsPerUsd(currency: CurrencyCode): bigint {
  return currency === "USD" ? RATE_SCALE : usdRates[currency];
}

export function getMidMarketRate(
  sellCurrency: CurrencyCode,
  buyCurrency: CurrencyCode,
): string {
  return scaledToDecimal(
    (unitsPerUsd(buyCurrency) * RATE_SCALE) / unitsPerUsd(sellCurrency),
  );
}

function buildRates(
  base: CurrencyCode,
  snapshot: Record<Exclude<CurrencyCode, "USD">, bigint>,
): RatesResponse["rates"] {
  const rates: RatesResponse["rates"] = {};
  const units = (currency: CurrencyCode) =>
    currency === "USD" ? RATE_SCALE : snapshot[currency];

  for (const currency of CURRENCIES) {
    if (currency === base) continue;
    rates[currency] = scaledToDecimal(
      (units(currency) * RATE_SCALE) / units(base),
    );
  }

  return rates;
}

function driftRates() {
  for (const currency of Object.keys(usdRates) as Array<
    Exclude<CurrencyCode, "USD">
  >) {
    const basisPoints = BigInt(Math.floor(Math.random() * 101) - 50);
    const next = (usdRates[currency] * (10_000n + basisPoints)) / 10_000n;
    usdRates[currency] = next > 0n ? next : 1n;
  }
}

export function getLiveRates(base: CurrencyCode): RatesResponse {
  if (debugFlags.forceRatesOutage || Math.random() < 0.1) {
    throw new Error("RATES_UNAVAILABLE");
  }

  const previousSnapshot = { ...usdRates };
  driftRates();

  return {
    base,
    rates: buildRates(base, usdRates),
    previousRates: buildRates(base, previousSnapshot),
    timestamp: new Date().toISOString(),
  };
}
