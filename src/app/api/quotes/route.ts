import { errorResponse } from "@/server/errors";
import { simulateLatency } from "@/server/latency";

export async function POST() {
  await simulateLatency();
  return errorResponse(501, "NOT_IMPLEMENTED", "Quotes are not implemented yet.");
}
