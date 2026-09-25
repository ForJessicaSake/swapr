"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import type { CurrencyCode } from "@/constants/currencies";
import { RATE_POLL_INTERVAL_MS } from "@/constants/timings";
import { usePageVisibility } from "@/hooks/use-page-visibility";
import { getRates } from "@/lib/api/rates";
import { QueryKey, QUERY_KEYS } from "@/types/query-keys";

export function useRates(baseCurrency: CurrencyCode) {
  const isTabVisible = usePageVisibility();
  const wasHidden = useRef(false);
  const ratesQuery = useQuery({
    queryKey: QUERY_KEYS[QueryKey.Rates](baseCurrency),
    queryFn: () => getRates(baseCurrency),
    placeholderData: (previous) => previous,
    refetchInterval: isTabVisible ? RATE_POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
    retry: 2,
  });
  const refetch = ratesQuery.refetch;

  useEffect(() => {
    if (!isTabVisible) {
      wasHidden.current = true;
      return;
    }
    if (wasHidden.current) {
      wasHidden.current = false;
      void refetch();
    }
  }, [isTabVisible, refetch]);

  return ratesQuery;
}
