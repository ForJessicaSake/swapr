import { ApiError } from "@/server/api-error";
import {
  consumedQuoteIds,
  conversions,
  debugFlags,
  getBalance,
  idempotencyResults,
  quotes,
  setBalance,
} from "@/server/store";
import type {
  Conversion,
  CreateConversionRequest,
} from "@/types/conversions";

export function listConversions() {
  return {
    conversions: [...conversions].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    ),
  };
}

export function executeConversion(body: CreateConversionRequest): Conversion {
  if (
    typeof body.quoteId !== "string" ||
    body.quoteId.length === 0 ||
    typeof body.idempotencyKey !== "string" ||
    body.idempotencyKey.length === 0
  ) {
    throw new ApiError(
      400,
      "INVALID_REQUEST",
      "A quoteId and idempotencyKey are required.",
    );
  }

  const replayed = idempotencyResults.get(body.idempotencyKey);
  if (replayed) {
    return replayed;
  }

  const quote = quotes.get(body.quoteId);
  if (!quote) {
    throw new ApiError(404, "QUOTE_NOT_FOUND", "This quote could not be found.");
  }

  const forceExpired = debugFlags.forceNextQuoteExpired;
  if (forceExpired) {
    debugFlags.forceNextQuoteExpired = false;
  }

  const isExpired =
    forceExpired || Date.now() > new Date(quote.expiresAt).getTime();
  if (isExpired) {
    throw new ApiError(
      410,
      "QUOTE_EXPIRED",
      "This quote has expired. Request a new one.",
    );
  }

  if (consumedQuoteIds.has(quote.id)) {
    throw new ApiError(
      400,
      "INVALID_REQUEST",
      "This quote has already been used.",
    );
  }

  const totalDebit = BigInt(quote.sellAmount) + BigInt(quote.fee.amount);
  if (totalDebit > getBalance(quote.sellCurrency)) {
    throw new ApiError(
      422,
      "INSUFFICIENT_FUNDS",
      "This amount and its fee are above your available balance.",
    );
  }

  setBalance(quote.sellCurrency, getBalance(quote.sellCurrency) - totalDebit);
  setBalance(
    quote.buyCurrency,
    getBalance(quote.buyCurrency) + BigInt(quote.buyAmount),
  );
  consumedQuoteIds.add(quote.id);

  const conversion: Conversion = {
    id: `cv_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`,
    quoteId: quote.id,
    status: "completed",
    sellCurrency: quote.sellCurrency,
    sellAmount: quote.sellAmount,
    buyCurrency: quote.buyCurrency,
    buyAmount: quote.buyAmount,
    rate: quote.rate,
    fee: quote.fee,
    createdAt: new Date().toISOString(),
  };

  conversions.unshift(conversion);
  idempotencyResults.set(body.idempotencyKey, conversion);
  return conversion;
}
