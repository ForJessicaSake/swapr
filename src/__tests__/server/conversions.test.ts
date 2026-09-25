import { executeConversion, listConversions } from "@/server/conversions";
import { ApiError } from "@/server/api-error";
import { createLockedQuote } from "@/server/quotes";
import {
  debugFlags,
  getBalance,
  quotes,
  resetStore,
  setBalance,
} from "@/server/store";
import { applySpread, calculateFee } from "@/utils/money";

describe("locked quotes and conversions", () => {
  beforeEach(() => {
    resetStore();
  });

  it("locks a 0.5% worse rate, charges fee on top, and lasts 30 seconds", () => {
    const quote = createLockedQuote({
      sellCurrency: "USD",
      buyCurrency: "NGN",
      sellAmount: "10000",
    });

    expect(quote.id).toMatch(/^qt_/);
    expect(quote.fee).toEqual({ currency: "USD", amount: "50" });
    expect(quote.rate).toBe(applySpread("1532.45120000"));
    expect(calculateFee(quote.sellAmount)).toBe("50");
    expect(
      new Date(quote.expiresAt).getTime() - new Date(quote.serverTime).getTime(),
    ).toBe(30_000);
  });

  it("accepts buyAmount instead of sellAmount", () => {
    const quote = createLockedQuote({
      sellCurrency: "USD",
      buyCurrency: "NGN",
      buyAmount: "15247890",
    });
    expect(BigInt(quote.sellAmount) > 0n).toBe(true);
    expect(quote.buyAmount).toBe("15247890");
  });

  it("rejects converting a currency to itself", () => {
    expect(() =>
      createLockedQuote({
        sellCurrency: "USD",
        buyCurrency: "USD",
        sellAmount: "10000",
      }),
    ).toThrow(ApiError);
  });

  it("rejects a quote when both amounts or neither amount is sent", () => {
    expect(() =>
      createLockedQuote({
        sellCurrency: "USD",
        buyCurrency: "NGN",
      }),
    ).toThrow(/exactly one/);
    expect(() =>
      createLockedQuote({
        sellCurrency: "USD",
        buyCurrency: "NGN",
        sellAmount: "10000",
        buyAmount: "10000",
      }),
    ).toThrow(/exactly one/);
  });

  it("rejects quotes that exceed the available balance including fee", () => {
    expect(() =>
      createLockedQuote({
        sellCurrency: "GBP",
        buyCurrency: "USD",
        sellAmount: "100",
      }),
    ).toThrow(/above your available balance/);
  });

  it("executes a conversion once, updates balances, and replays the same idempotency key", () => {
    const quote = createLockedQuote({
      sellCurrency: "USD",
      buyCurrency: "NGN",
      sellAmount: "10000",
    });
    const usdBefore = getBalance("USD");
    const ngnBefore = getBalance("NGN");

    const first = executeConversion({
      quoteId: quote.id,
      idempotencyKey: "same-key",
    });
    const replay = executeConversion({
      quoteId: quote.id,
      idempotencyKey: "same-key",
    });

    expect(replay).toEqual(first);
    expect(first.buyAmount).toBe(quote.buyAmount);
    expect(first.rate).toBe(quote.rate);
    expect(getBalance("USD")).toBe(
      usdBefore - BigInt(quote.sellAmount) - BigInt(quote.fee.amount),
    );
    expect(getBalance("NGN")).toBe(ngnBefore + BigInt(quote.buyAmount));
    expect(() =>
      executeConversion({ quoteId: quote.id, idempotencyKey: "other-key" }),
    ).toThrow(/already been used/);
  });

  it("lists conversions newest first", () => {
    const firstQuote = createLockedQuote({
      sellCurrency: "USD",
      buyCurrency: "NGN",
      sellAmount: "10000",
    });
    executeConversion({
      quoteId: firstQuote.id,
      idempotencyKey: "first",
    });
    const secondQuote = createLockedQuote({
      sellCurrency: "USD",
      buyCurrency: "NGN",
      sellAmount: "10000",
    });
    const second = executeConversion({
      quoteId: secondQuote.id,
      idempotencyKey: "second",
    });

    expect(listConversions().conversions[0]?.id).toBe(second.id);
  });

  it("returns QUOTE_EXPIRED without changing balances", () => {
    const quote = createLockedQuote({
      sellCurrency: "USD",
      buyCurrency: "NGN",
      sellAmount: "10000",
    });
    const stored = quotes.get(quote.id);
    if (!stored) throw new Error("missing quote");
    stored.expiresAt = new Date(Date.now() - 1_000).toISOString();
    const usdBefore = getBalance("USD");

    expect(() =>
      executeConversion({
        quoteId: quote.id,
        idempotencyKey: "expired-key",
      }),
    ).toThrow(/expired/);
    expect(getBalance("USD")).toBe(usdBefore);
  });

  it("returns QUOTE_NOT_FOUND for an unknown quote", () => {
    expect(() =>
      executeConversion({
        quoteId: "qt_missing",
        idempotencyKey: "nope",
      }),
    ).toThrow(/could not be found/);
  });

  it("rejects confirmation when funds disappeared after the quote", () => {
    const quote = createLockedQuote({
      sellCurrency: "USD",
      buyCurrency: "NGN",
      sellAmount: "10000",
    });
    setBalance("USD", 0n);
    expect(() =>
      executeConversion({
        quoteId: quote.id,
        idempotencyKey: "broke",
      }),
    ).toThrow(/above your available balance/);
  });

  it("honours the debug expire-next-quote flag without debiting", () => {
    const quote = createLockedQuote({
      sellCurrency: "USD",
      buyCurrency: "NGN",
      sellAmount: "10000",
    });
    debugFlags.forceNextQuoteExpired = true;
    const usdBefore = getBalance("USD");

    expect(() =>
      executeConversion({
        quoteId: quote.id,
        idempotencyKey: "forced-expire",
      }),
    ).toThrow(/expired/);
    expect(getBalance("USD")).toBe(usdBefore);
    expect(debugFlags.forceNextQuoteExpired).toBe(false);
  });
});
