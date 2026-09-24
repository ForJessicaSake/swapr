"use client";

import { useQuery } from "@tanstack/react-query";

import { DEMO_CONVERSIONS } from "@/lib/demo-data";
import { QueryKey, QUERY_KEYS } from "@/types/query-keys";

export function useConversions() {
  return useQuery({
    queryKey: QUERY_KEYS[QueryKey.Conversions],
    queryFn: async () => DEMO_CONVERSIONS,
  });
}
