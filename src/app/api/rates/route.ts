import { NextResponse } from "next/server";

import { CURRENCIES, type CurrencyCode } from "@/constants/currencies";
import { errorResponse } from "@/server/errors";
import { simulateLatency } from "@/server/latency";
import { getLiveRates } from "@/server/rates";
import { withStoreLock } from "@/server/store";

export async function GET(request: Request) {
  await simulateLatency();

  const base = new URL(request.url).searchParams.get("base") ?? "USD";
  if (!(CURRENCIES as readonly string[]).includes(base)) {
    return errorResponse(400, "INVALID_REQUEST", "Choose a supported base currency.");
  }

  try {
    const payload = await withStoreLock(() =>
      getLiveRates(base as CurrencyCode),
    );
    return NextResponse.json(payload);
  } catch {
    return errorResponse(
      503,
      "RATES_UNAVAILABLE",
      "Live rates are temporarily unavailable.",
    );
  }
}
