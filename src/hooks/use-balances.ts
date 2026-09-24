"use client";

import { useQuery } from "@tanstack/react-query";

import { DEMO_BALANCES } from "@/lib/demo-data";
import { QueryKey, QUERY_KEYS } from "@/types/query-keys";

export function useBalances() {
  return useQuery({
    queryKey: QUERY_KEYS[QueryKey.Balances],
    queryFn: async () => DEMO_BALANCES,
  });
}
