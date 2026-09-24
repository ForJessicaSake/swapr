import { api } from "@/lib/api/client";
import type { CurrencyCode } from "@/constants/currencies";
import type { RatesResponse } from "@/types/rates";

export async function getRates(base: CurrencyCode) {
  const { data } = await api.get<RatesResponse>("/rates", {
    params: { base },
  });
  return data;
}
