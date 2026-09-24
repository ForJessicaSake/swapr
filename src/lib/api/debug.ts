import { api } from "@/lib/api/client";
import type { DebugAction } from "@/types/debug";

export type { DebugAction };

export async function postDebugAction(action: DebugAction) {
  const { data } = await api.post<{ ok: true }>("/debug", { action });
  return data;
}
