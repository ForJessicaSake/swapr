"use client";

import { useEffect, useRef, useState } from "react";

import { CURRENCIES, type CurrencyCode } from "@/constants/currencies";
import { RATE_HISTORY_LIMIT } from "@/utils/sparkline";
import type { RatesResponse } from "@/types/rates";

export function useRateHistory(
  baseCurrency: CurrencyCode,
  snapshot: RatesResponse | undefined,
  skipFailedPoll: boolean,
) {
  const lastTimestamp = useRef<string | null>(null);
  const [series, setSeries] = useState<
    Partial<Record<CurrencyCode, string[]>>
  >({});

  useEffect(() => {
    if (!snapshot || skipFailedPoll) return;
    if (snapshot.base !== baseCurrency) return;
    if (snapshot.timestamp === lastTimestamp.current) return;

    const timestamp = snapshot.timestamp;
    const rates = snapshot.rates;
    const frame = window.requestAnimationFrame(() => {
      lastTimestamp.current = timestamp;
      setSeries((previous) => {
        const next: Partial<Record<CurrencyCode, string[]>> = { ...previous };
        for (const currency of CURRENCIES) {
          if (currency === baseCurrency) continue;
          const rate = rates[currency];
          if (!rate) continue;
          next[currency] = [...(next[currency] ?? []), rate].slice(
            -RATE_HISTORY_LIMIT,
          );
        }
        return next;
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [baseCurrency, skipFailedPoll, snapshot]);

  return series;
}
