"use client";

import { useQuery } from "@tanstack/react-query";

import { getBalances } from "@/lib/api/balances";
import { QueryKey, QUERY_KEYS } from "@/types/query-keys";

export function useBalances() {
  return useQuery({
    queryKey: QUERY_KEYS[QueryKey.Balances],
    queryFn: getBalances,
  });
}
