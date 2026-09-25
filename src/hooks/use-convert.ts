"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createConversion } from "@/lib/api/conversions";
import type { CreateConversionRequest } from "@/types/conversions";
import { QueryKey, QUERY_KEYS } from "@/types/query-keys";

export function useConvert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateConversionRequest) => createConversion(request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS[QueryKey.Balances] }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS[QueryKey.Conversions],
        }),
      ]);
    },
  });
}
