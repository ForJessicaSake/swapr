"use client";

import { useMutation } from "@tanstack/react-query";

import { createQuote } from "@/lib/api/quotes";
import type { CreateQuoteRequest } from "@/types/quotes";

export function useCreateQuote() {
  return useMutation({
    mutationFn: (request: CreateQuoteRequest) => createQuote(request),
  });
}
