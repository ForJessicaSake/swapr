"use client";

import { useQuery } from "@tanstack/react-query";

import { getBalances } from "@/lib/api/balances";
import { queryKeys } from "@/lib/query-keys";

export function useBalances() {
  return useQuery({
    queryKey: queryKeys.balances,
    queryFn: getBalances,
  });
}
