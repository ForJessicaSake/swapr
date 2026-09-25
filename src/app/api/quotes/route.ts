import { NextResponse } from "next/server";

import { ApiError } from "@/server/api-error";
import { jsonError } from "@/server/errors";
import { simulateLatency } from "@/server/latency";
import { createLockedQuote } from "@/server/quotes";
import { withStoreLock } from "@/server/store";
import type { CreateQuoteRequest } from "@/types/quotes";

export async function POST(request: Request) {
  await simulateLatency();

  let body: CreateQuoteRequest;
  try {
    body = (await request.json()) as CreateQuoteRequest;
  } catch {
    return jsonError(
      new ApiError(400, "INVALID_REQUEST", "The quote request was invalid."),
    );
  }

  try {
    const quote = await withStoreLock(() => createLockedQuote(body));
    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return jsonError(error);
    throw error;
  }
}
