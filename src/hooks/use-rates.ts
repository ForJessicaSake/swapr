"use client";

import { useQuery } from "@tanstack/react-query";

import { RATE_POLL_INTERVAL_MS } from "@/constants/timings";
import type { CurrencyCode } from "@/constants/currencies";
import { getRates } from "@/lib/api/rates";
import { queryKeys } from "@/lib/query-keys";
import { usePageVisibility } from "@/hooks/use-page-visibility";

export function useRates(base: CurrencyCode) {
  const isVisible = usePageVisibility();

  return useQuery({
    queryKey: queryKeys.rates(base),
    queryFn: () => getRates(base),
    refetchInterval: isVisible ? RATE_POLL_INTERVAL_MS : false,
  });
}
