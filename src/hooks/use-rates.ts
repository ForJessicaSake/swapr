"use client";

import { useQuery } from "@tanstack/react-query";

import type { CurrencyCode } from "@/constants/currencies";
import { RATE_POLL_INTERVAL_MS } from "@/constants/timings";
import { getDemoExchangeRates } from "@/lib/demo-data";
import { QueryKey, QUERY_KEYS } from "@/types/query-keys";

export function useRates(baseCurrency: CurrencyCode) {
  return useQuery({
    queryKey: QUERY_KEYS[QueryKey.Rates](baseCurrency),
    queryFn: async () => getDemoExchangeRates(baseCurrency),
    refetchInterval: RATE_POLL_INTERVAL_MS,
  });
}
