import { api } from "@/lib/api/client";
import type {
  Conversion,
  ConversionsResponse,
  CreateConversionRequest,
} from "@/types/conversions";

export async function createConversion(body: CreateConversionRequest) {
  const { data } = await api.post<Conversion>("/conversions", body);
  return data;
}

export async function getConversions() {
  const { data } = await api.get<ConversionsResponse>("/conversions");
  return data;
}
