"use client";

import { useQuery } from "@tanstack/react-query";

import { getConversions } from "@/lib/api/conversions";
import { QueryKey, QUERY_KEYS } from "@/types/query-keys";

export function useConversions() {
  return useQuery({
    queryKey: QUERY_KEYS[QueryKey.Conversions],
    queryFn: getConversions,
  });
}
