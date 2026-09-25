import { NextResponse } from "next/server";

import { ApiError } from "@/server/api-error";
import type { ApiErrorBody, ApiErrorCode } from "@/types/errors";

export function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
) {
  const body: ApiErrorBody = { error: { code, message } };
  return NextResponse.json(body, { status });
}

export function jsonError(error: ApiError) {
  return errorResponse(error.status, error.code, error.message);
}
