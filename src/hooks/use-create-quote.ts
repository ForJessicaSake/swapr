"use client";

import { useMutation } from "@tanstack/react-query";

export function useCreateQuote() {
  return useMutation({
    mutationFn: async (request: unknown) => {
      void request;
      throw new Error("Quotes API is not connected yet.");
    },
  });
}
