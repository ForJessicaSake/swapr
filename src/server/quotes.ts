import {
  CURRENCIES,
  DECIMAL_PLACES,
  type CurrencyCode,
} from "@/constants/currencies";
import { QUOTE_LOCK_DURATION_MS } from "@/constants/timings";
import { ApiError } from "@/server/api-error";
import { getMidMarketRate } from "@/server/rates";
import { getBalance, quotes } from "@/server/store";
import type { CreateQuoteRequest, Quote } from "@/types/quotes";
import {
  applySpread,
  calculateFee,
  convertBuyToSell,
  convertSellToBuy,
} from "@/utils/money";

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return (
    typeof value === "string" &&
    (CURRENCIES as readonly string[]).includes(value)
  );
}

function isPositiveMinorAmount(value: unknown): value is string {
  return typeof value === "string" && /^\d+$/.test(value) && BigInt(value) > 0n;
}

export function createLockedQuote(body: CreateQuoteRequest): Quote {
  if (!isCurrencyCode(body.sellCurrency) || !isCurrencyCode(body.buyCurrency)) {
    throw new ApiError(400, "INVALID_REQUEST", "Choose two supported currencies.");
  }

  if (body.sellCurrency === body.buyCurrency) {
    throw new ApiError(400, "INVALID_REQUEST", "Choose two different currencies.");
  }

  const hasSellAmount = body.sellAmount !== undefined;
  const hasBuyAmount = body.buyAmount !== undefined;
  if (hasSellAmount === hasBuyAmount) {
    throw new ApiError(
      400,
      "INVALID_REQUEST",
      "Provide exactly one of sellAmount or buyAmount.",
    );
  }

  const quotedRate = applySpread(
    getMidMarketRate(body.sellCurrency, body.buyCurrency),
  );

  let sellAmount: string;
  let buyAmount: string;

  if (hasSellAmount) {
    if (!isPositiveMinorAmount(body.sellAmount)) {
      throw new ApiError(400, "INVALID_REQUEST", "Enter a valid amount to send.");
    }
    sellAmount = body.sellAmount;
    buyAmount = convertSellToBuy(
      sellAmount,
      quotedRate,
      DECIMAL_PLACES[body.sellCurrency],
      DECIMAL_PLACES[body.buyCurrency],
    );
  } else {
    if (!isPositiveMinorAmount(body.buyAmount)) {
      throw new ApiError(
        400,
        "INVALID_REQUEST",
        "Enter a valid amount to receive.",
      );
    }
    buyAmount = body.buyAmount;
    sellAmount = convertBuyToSell(
      buyAmount,
      quotedRate,
      DECIMAL_PLACES[body.sellCurrency],
      DECIMAL_PLACES[body.buyCurrency],
    );
  }

  if (BigInt(buyAmount) <= 0n || BigInt(sellAmount) <= 0n) {
    throw new ApiError(400, "INVALID_REQUEST", "Enter an amount greater than zero.");
  }

  const feeAmount = calculateFee(sellAmount);
  const totalDebit = BigInt(sellAmount) + BigInt(feeAmount);
  if (totalDebit > getBalance(body.sellCurrency)) {
    throw new ApiError(
      422,
      "INSUFFICIENT_FUNDS",
      "This amount and its fee are above your available balance.",
    );
  }

  const now = Date.now();
  const quote: Quote = {
    id: `qt_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`,
    sellCurrency: body.sellCurrency,
    buyCurrency: body.buyCurrency,
    sellAmount,
    buyAmount,
    rate: quotedRate,
    fee: { currency: body.sellCurrency, amount: feeAmount },
    expiresAt: new Date(now + QUOTE_LOCK_DURATION_MS).toISOString(),
    serverTime: new Date(now).toISOString(),
  };

  quotes.set(quote.id, quote);
  return quote;
}
