"use client";

import { useQuery } from "@tanstack/react-query";

import { getConversions } from "@/lib/api/conversions";
import { queryKeys } from "@/lib/query-keys";

export function useConversions() {
  return useQuery({
    queryKey: queryKeys.conversions,
    queryFn: getConversions,
  });
}
