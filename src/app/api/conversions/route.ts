import { errorResponse } from "@/server/errors";
import { simulateLatency } from "@/server/latency";

export async function GET() {
  await simulateLatency();
  return errorResponse(
    501,
    "NOT_IMPLEMENTED",
    "Conversion history is not implemented yet.",
  );
}

export async function POST() {
  await simulateLatency();
  return errorResponse(
    501,
    "NOT_IMPLEMENTED",
    "Conversions are not implemented yet.",
  );
}
