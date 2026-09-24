import { NextResponse } from "next/server";

import type { ApiErrorBody, ApiErrorCode } from "@/types/errors";

export function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
) {
  const body: ApiErrorBody = { error: { code, message } };
  return NextResponse.json(body, { status });
}
