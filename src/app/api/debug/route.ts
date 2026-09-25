import { NextResponse } from "next/server";

import { applyDebugAction } from "@/server/debug";
import { errorResponse } from "@/server/errors";
import { debugFlags, withStoreLock } from "@/server/store";
import type { DebugAction } from "@/types/debug";

const actions: DebugAction[] = [
  "rates-outage",
  "expire-next-quote",
  "reset-balances",
];

export async function GET() {
  return NextResponse.json({
    forceRatesOutage: debugFlags.forceRatesOutage,
    forceNextQuoteExpired: debugFlags.forceNextQuoteExpired,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { action?: DebugAction };

  const action = body.action;
  if (!action || !actions.includes(action)) {
    return errorResponse(400, "INVALID_REQUEST", "Unknown debug action.");
  }

  const result = await withStoreLock(() => applyDebugAction(action));
  return NextResponse.json({ ok: true, ...result });
}
