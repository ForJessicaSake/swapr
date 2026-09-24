"use client";

import { useMutation } from "@tanstack/react-query";

import { createQuote } from "@/lib/api/quotes";
import type { CreateQuoteRequest } from "@/types/quotes";

export function useQuote() {
  return useMutation({
    mutationFn: (body: CreateQuoteRequest) => createQuote(body),
  });
}
