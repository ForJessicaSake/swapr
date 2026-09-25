import { api } from "@/lib/api/client";
import type { BalancesResponse } from "@/types/balances";

export async function getBalances() {
  const { data } = await api.get<BalancesResponse>("/balances");
  return data;
}
