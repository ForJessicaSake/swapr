import { NextResponse } from "next/server";

import { applyDebugAction } from "@/server/debug";
import { errorResponse } from "@/server/errors";
import type { DebugAction } from "@/types/debug";

const actions: DebugAction[] = [
  "rates-outage",
  "expire-next-quote",
  "reset-balances",
];

export async function POST(request: Request) {
  const body = (await request.json()) as { action?: DebugAction };

  if (!body.action || !actions.includes(body.action)) {
    return errorResponse(400, "NOT_IMPLEMENTED", "Unknown debug action.");
  }

  applyDebugAction(body.action);
  return NextResponse.json({ ok: true });
}
