import { errorResponse } from "@/server/errors";
import { simulateLatency } from "@/server/latency";

export async function GET() {
  await simulateLatency();
  return errorResponse(501, "NOT_IMPLEMENTED", "Rates are not implemented yet.");
}
