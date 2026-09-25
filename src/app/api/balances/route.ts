import { NextResponse } from "next/server";

import { simulateLatency } from "@/server/latency";
import { balances, withStoreLock } from "@/server/store";

export async function GET() {
  await simulateLatency();
  const payload = await withStoreLock(() => ({
    balances: balances.map((balance) => ({ ...balance })),
  }));
  return NextResponse.json(payload);
}
