import { api } from "@/lib/api/client";
import type { CreateQuoteRequest, Quote } from "@/types/quotes";

export async function createQuote(body: CreateQuoteRequest) {
  const { data } = await api.post<Quote>("/quotes", body);
  return data;
}
