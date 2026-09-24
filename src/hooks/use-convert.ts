"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createConversion } from "@/lib/api/conversions";
import { queryKeys } from "@/lib/query-keys";
import type { CreateConversionRequest } from "@/types/conversions";

export function useConvert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateConversionRequest) => createConversion(body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.balances }),
        queryClient.invalidateQueries({ queryKey: queryKeys.conversions }),
      ]);
    },
  });
}
