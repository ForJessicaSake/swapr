import { NextResponse } from "next/server";

import { executeConversion, listConversions } from "@/server/conversions";
import { ApiError } from "@/server/api-error";
import { jsonError } from "@/server/errors";
import { simulateLatency } from "@/server/latency";
import { withStoreLock } from "@/server/store";
import type { CreateConversionRequest } from "@/types/conversions";

export async function GET() {
  await simulateLatency();
  const payload = await withStoreLock(() => listConversions());
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  await simulateLatency();

  let body: CreateConversionRequest;
  try {
    body = (await request.json()) as CreateConversionRequest;
  } catch {
    return jsonError(
      new ApiError(400, "INVALID_REQUEST", "The conversion request was invalid."),
    );
  }

  try {
    const conversion = await withStoreLock(() => executeConversion(body));
    return NextResponse.json(conversion, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return jsonError(error);
    throw error;
  }
}
