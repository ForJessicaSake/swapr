"use client";

import axios from "axios";
import { useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  CURRENCIES,
  CURRENCY_SYMBOLS,
  DECIMAL_PLACES,
  type CurrencyCode,
} from "@/constants/currencies";
import { QUOTE_LOCK_DURATION_MS } from "@/constants/timings";
import { ConversionReceipt } from "@/components/history/receipt";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ControlledInput } from "@/components/ui/input";
import { ControlledSelect } from "@/components/ui/select";
import { useBalances } from "@/hooks/use-balances";
import { useConvert } from "@/hooks/use-convert";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useCreateQuote } from "@/hooks/use-create-quote";
import { useRates } from "@/hooks/use-rates";
import type { Conversion } from "@/types/conversions";
import type { ApiErrorBody } from "@/types/errors";
import type { Quote } from "@/types/quotes";
import {
  formatMinorForInput,
  formatMoney,
  formatRate,
  parseAmountToMinor,
  sanitizeAmountInput,
} from "@/utils/format";
import { createIdempotencyKey } from "@/utils/idempotency";
import {
  calculateFee,
  convertBuyToSell,
  convertSellToBuy,
} from "@/utils/money";

type AmountMode = "sell" | "buy";

type ConvertValues = {
  amount: string;
  buyCurrency: CurrencyCode;
  mode: AmountMode;
  sellCurrency: CurrencyCode;
};

function readApiError(error: unknown): ApiErrorBody["error"] | null {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return null;
  return error.response?.data.error ?? null;
}

function maxSellableMinorUnits(balance: string): string {
  let low = 0n;
  let high = BigInt(balance);
  while (low < high) {
    const middle = (low + high + 1n) / 2n;
    const total = middle + BigInt(calculateFee(middle.toString()));
    if (total <= BigInt(balance)) low = middle;
    else high = middle - 1n;
  }
  return low.toString();
}

export function ConvertForm() {
  const { control, reset, setValue } = useForm<ConvertValues>({
    defaultValues: {
      amount: "",
      buyCurrency: "NGN",
      mode: "sell",
      sellCurrency: "USD",
    },
  });
  const amountValue = useWatch({ control, name: "amount" });
  const amountMode = useWatch({ control, name: "mode" });
  const buyCurrency = useWatch({ control, name: "buyCurrency" });
  const sellCurrency = useWatch({ control, name: "sellCurrency" });

  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteReceivedAt, setQuoteReceivedAt] = useState(0);
  const [previousQuote, setPreviousQuote] = useState<Quote | null>(null);
  const [conversion, setConversion] = useState<Conversion | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const idempotencyKey = useRef<string | null>(null);

  const balancesQuery = useBalances();
  const ratesQuery = useRates(sellCurrency);
  const createQuote = useCreateQuote();
  const executeConversion = useConvert();
  const currentTimeMs = useCurrentTime(250);

  const rate = ratesQuery.data?.rates[buyCurrency];
  const estimatedAmounts = useMemo(() => {
    if (!rate || !amountValue) {
      return {
        sell: amountMode === "sell" ? amountValue : "",
        buy: amountMode === "buy" ? amountValue : "",
      };
    }

    if (amountMode === "sell") {
      const parsed = parseAmountToMinor(
        amountValue,
        DECIMAL_PLACES[sellCurrency],
      );
      if (!parsed || BigInt(parsed) === 0n) {
        return { sell: amountValue, buy: "" };
      }
      const estimate = convertSellToBuy(
        parsed,
        rate,
        DECIMAL_PLACES[sellCurrency],
        DECIMAL_PLACES[buyCurrency],
      );
      return {
        sell: amountValue,
        buy: formatMinorForInput(estimate, DECIMAL_PLACES[buyCurrency]),
      };
    }

    const parsed = parseAmountToMinor(
      amountValue,
      DECIMAL_PLACES[buyCurrency],
    );
    if (!parsed || BigInt(parsed) === 0n) {
      return { sell: "", buy: amountValue };
    }
    const estimate = convertBuyToSell(
      parsed,
      rate,
      DECIMAL_PLACES[sellCurrency],
      DECIMAL_PLACES[buyCurrency],
    );
    return {
      sell: formatMinorForInput(estimate, DECIMAL_PLACES[sellCurrency]),
      buy: amountValue,
    };
  }, [amountMode, amountValue, buyCurrency, rate, sellCurrency]);
  const sellValue = estimatedAmounts.sell;
  const buyValue = estimatedAmounts.buy;
  const sellMinor = parseAmountToMinor(
    sellValue,
    DECIMAL_PLACES[sellCurrency],
  );
  const buyMinor = parseAmountToMinor(buyValue, DECIMAL_PLACES[buyCurrency]);
  const sellBalance =
    balancesQuery.data?.balances.find(
      (balance) => balance.currency === sellCurrency,
    )?.amount ?? "0";

  const invalidateQuote = () => {
    if (quote) setPreviousQuote(quote);
    setQuote(null);
    idempotencyKey.current = null;
    executeConversion.reset();
    setFormError(null);
  };

  const remainingLockMs = quote
    ? Math.max(
        0,
        new Date(quote.expiresAt).getTime() -
          new Date(quote.serverTime).getTime() -
          (currentTimeMs - quoteReceivedAt),
      )
    : 0;
  const hasQuoteExpired = Boolean(quote && remainingLockMs <= 0);

  const totalDebit = quote
    ? (BigInt(quote.sellAmount) + BigInt(quote.fee.amount)).toString()
    : null;

  const localValidation = useMemo(() => {
    if (!sellMinor || !buyMinor) return "Enter an amount to continue.";
    if (BigInt(sellMinor) <= 0n || BigInt(buyMinor) <= 0n) {
      return "Enter an amount greater than zero.";
    }
    const estimatedFee = BigInt(calculateFee(sellMinor));
    if (BigInt(sellMinor) + estimatedFee > BigInt(sellBalance)) {
      return "This amount and its fee are above your available balance.";
    }
    return null;
  }, [buyMinor, sellBalance, sellMinor]);

  const requestQuote = async () => {
    if (localValidation || !sellMinor || !buyMinor) {
      setFormError(localValidation);
      return;
    }
    setFormError(null);
    try {
      const nextQuote = await createQuote.mutateAsync({
        sellCurrency,
        buyCurrency,
        ...(amountMode === "sell"
          ? { sellAmount: sellMinor }
          : { buyAmount: buyMinor }),
      });
      if (quote) setPreviousQuote(quote);
      setQuote(nextQuote);
      setQuoteReceivedAt(Date.now());
      idempotencyKey.current = createIdempotencyKey();
    } catch (error) {
      setFormError(
        readApiError(error)?.message ?? "We couldn't lock this quote. Try again.",
      );
    }
  };

  const confirmConversion = async () => {
    if (!quote || hasQuoteExpired || executeConversion.isPending) return;
    const key = idempotencyKey.current ?? createIdempotencyKey();
    idempotencyKey.current = key;
    setFormError(null);
    try {
      const result = await executeConversion.mutateAsync({
        quoteId: quote.id,
        idempotencyKey: key,
      });
      setConversion(result);
    } catch (error) {
      const apiError = readApiError(error);
      if (apiError?.code === "QUOTE_EXPIRED") {
        setFormError("The rate changed before we could confirm. Get a fresh quote.");
      } else {
        setFormError(
          apiError?.message ?? "The conversion didn't go through. Your balance is unchanged.",
        );
      }
    }
  };

  const handleAmountChange = (mode: AmountMode, value: string) => {
    const decimalPlaces =
      DECIMAL_PLACES[mode === "sell" ? sellCurrency : buyCurrency];
    const nextAmount = sanitizeAmountInput(value, decimalPlaces);
    if (nextAmount === amountValue && mode === amountMode) return;
    invalidateQuote();
    setValue("mode", mode);
    setValue("amount", nextAmount);
  };

  const switchCurrencies = () => {
    invalidateQuote();
    setValue("sellCurrency", buyCurrency);
    setValue("buyCurrency", sellCurrency);
    setValue("mode", "sell");
    setValue("amount", buyValue);
  };

  const worseDifference =
    previousQuote &&
    quote &&
    previousQuote.sellCurrency === quote.sellCurrency &&
    previousQuote.buyCurrency === quote.buyCurrency &&
    previousQuote.sellAmount === quote.sellAmount &&
    BigInt(quote.buyAmount) < BigInt(previousQuote.buyAmount)
      ? (BigInt(previousQuote.buyAmount) - BigInt(quote.buyAmount)).toString()
      : null;

  return (
    <section
      aria-labelledby="convert-heading"
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(380px,.92fr)]"
    >
      <form
        className="surface p-5 sm:p-7"
        onSubmit={(event) => {
          event.preventDefault();
          void requestQuote();
        }}
      >
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-blue uppercase">
            New conversion
          </p>
          <h2
            id="convert-heading"
            className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-ink"
          >
            What would you like to swap?
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Enter the amount you want to send or receive.
          </p>
        </div>

        <div className="mt-7">
          <div className="rounded-2xl border border-line bg-surface p-4 transition focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/10">
            <ControlledInput
              action={
                <Button
                  onClick={() => {
                    invalidateQuote();
                    setValue("mode", "sell");
                    setValue(
                      "amount",
                      formatMinorForInput(
                        maxSellableMinorUnits(sellBalance),
                        DECIMAL_PLACES[sellCurrency],
                      ),
                    );
                  }}
                  size="sm"
                  variant="ghost"
                >
                  Use maximum
                </Button>
              }
              addon={
                <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-surface-muted px-3 py-2.5">
                  <span className="grid size-6 place-items-center rounded-full bg-surface text-xs font-semibold text-blue">
                    {CURRENCY_SYMBOLS[sellCurrency]}
                  </span>
                  <ControlledSelect
                    aria-label="You send currency"
                    control={control}
                    name="sellCurrency"
                    onChange={(event) => {
                      invalidateQuote();
                      setValue(
                        "sellCurrency",
                        event.target.value as CurrencyCode,
                      );
                    }}
                  >
                    {CURRENCIES.map((option) => (
                      <option
                        disabled={option === buyCurrency}
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                  </ControlledSelect>
                </label>
              }
              autoComplete="off"
              control={control}
              hint={`Available: ${formatMoney(sellBalance, sellCurrency)}`}
              inputMode="decimal"
              label="You send"
              name="amount"
              onChange={(event) =>
                handleAmountChange("sell", event.target.value)
              }
              onFocus={() => setValue("mode", "sell")}
              pattern="[0-9]*[.,]?[0-9]*"
              placeholder="0"
              spellCheck={false}
              value={sellValue}
              variant="ghost"
            />
          </div>

          <div className="relative z-10 -my-2 flex justify-center">
            <Button
              aria-label="Swap currencies"
              className="size-10 rounded-xl border-4 border-canvas bg-ink text-canvas hover:rotate-180 hover:bg-blue hover:text-white"
              onClick={switchCurrencies}
              variant="icon"
            >
              <Icon name="swap" size={17} />
            </Button>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 transition focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/10">
            <ControlledInput
              addon={
                <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-surface-muted px-3 py-2.5">
                  <span className="grid size-6 place-items-center rounded-full bg-surface text-xs font-semibold text-blue">
                    {CURRENCY_SYMBOLS[buyCurrency]}
                  </span>
                  <ControlledSelect
                    aria-label="You receive currency"
                    control={control}
                    name="buyCurrency"
                    onChange={(event) => {
                      invalidateQuote();
                      setValue(
                        "buyCurrency",
                        event.target.value as CurrencyCode,
                      );
                    }}
                  >
                    {CURRENCIES.map((option) => (
                      <option
                        disabled={option === sellCurrency}
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                  </ControlledSelect>
                </label>
              }
              autoComplete="off"
              control={control}
              hint={
                rate
                  ? `Estimate · 1 ${sellCurrency} = ${formatRate(rate)} ${buyCurrency}`
                  : "Fetching live rate…"
              }
              inputMode="decimal"
              label="You receive"
              name="amount"
              onChange={(event) =>
                handleAmountChange("buy", event.target.value)
              }
              onFocus={() => setValue("mode", "buy")}
              pattern="[0-9]*[.,]?[0-9]*"
              placeholder="0"
              spellCheck={false}
              value={buyValue}
              variant="ghost"
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-surface-muted p-4">
          <div className="flex gap-3">
            <Icon className="mt-0.5 shrink-0 text-ink-soft" name="info" size={17} />
            <p className="text-xs leading-5 text-ink-soft">
              Estimates move with the market. Request a quote when you&apos;re
              ready and we&apos;ll hold that rate for 30 seconds.
            </p>
          </div>
        </div>

        {formError && (
          <div
            aria-live="polite"
            className="mt-4 rounded-xl border border-red/30 bg-red-soft px-4 py-3 text-sm text-red"
          >
            {formError}
          </div>
        )}

        <Button
          className="mt-5 w-full"
          disabled={createQuote.isPending || Boolean(quote && !hasQuoteExpired)}
          size="lg"
          type="submit"
        >
          {createQuote.isPending
            ? "Locking your rate…"
            : quote && !hasQuoteExpired
              ? "Rate locked"
              : quote && hasQuoteExpired
                ? "Refresh quote"
                : "Get a locked quote"}
        </Button>
      </form>

      <aside className="surface overflow-hidden xl:sticky xl:top-[104px]">
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-ink">Quote summary</h3>
          <p className="mt-1 text-xs text-muted">
            Check every detail before you confirm.
          </p>
        </div>

        {!quote ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-blue-soft text-blue">
              <Icon name="clock" size={22} />
            </span>
            <p className="mt-4 text-sm font-semibold text-ink">
              No locked quote yet
            </p>
            <p className="mx-auto mt-2 max-w-[260px] text-xs leading-5 text-muted">
              Your final rate, fee and exact receive amount will appear here.
            </p>
          </div>
        ) : (
          <>
            <div
              aria-live="polite"
              className={`px-5 py-3 sm:px-6 ${
                hasQuoteExpired ? "bg-amber-soft" : "bg-green-soft"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div
                  className={`text-xs font-semibold ${
                    hasQuoteExpired ? "text-amber" : "text-green"
                  }`}
                >
                  {hasQuoteExpired ? "Quote expired" : "Rate locked"}
                </div>
                <p className="money text-xs font-semibold text-ink-soft">
                  {hasQuoteExpired ? "0s" : `${Math.ceil(remainingLockMs / 1_000)}s left`}
                </p>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/10">
                <div
                  className={`h-full rounded-full transition-[width] ${
                    hasQuoteExpired ? "bg-amber" : "bg-green"
                  }`}
                  style={{
                    width: `${Math.min(100, (remainingLockMs / QUOTE_LOCK_DURATION_MS) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-2xl bg-surface-muted p-5 text-center">
                <p className="text-xs text-ink-soft">You receive exactly</p>
                <p className="money mt-2 text-3xl font-semibold tracking-[-0.04em] text-ink">
                  {formatMoney(quote.buyAmount, quote.buyCurrency)}
                </p>
                {worseDifference && (
                  <p className="mt-2 text-xs font-medium text-red">
                    {formatMoney(worseDifference, quote.buyCurrency)} less than
                    your previous quote
                  </p>
                )}
              </div>

              <dl className="mt-5 divide-y divide-line">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm text-ink-soft">You send</dt>
                  <dd className="money text-sm font-semibold text-ink">
                    {formatMoney(quote.sellAmount, quote.sellCurrency)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm text-ink-soft">Rate</dt>
                  <dd className="money text-right text-sm font-semibold text-ink">
                    1 {quote.sellCurrency} = {formatRate(quote.rate)}{" "}
                    {quote.buyCurrency}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm text-ink-soft">Fee</dt>
                  <dd className="money text-sm font-semibold text-ink">
                    {formatMoney(quote.fee.amount, quote.fee.currency)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-sm font-medium text-ink-soft">
                    Total charged
                  </dt>
                  <dd className="money text-sm font-semibold text-ink">
                    {totalDebit &&
                      formatMoney(totalDebit, quote.sellCurrency)}
                  </dd>
                </div>
              </dl>

              <Button
                className="mt-5 w-full"
                disabled={hasQuoteExpired || executeConversion.isPending}
                onClick={confirmConversion}
                size="lg"
                variant="ink"
              >
                {executeConversion.isPending
                  ? "Converting…"
                  : hasQuoteExpired
                    ? "Quote expired"
                    : "Confirm conversion"}
              </Button>
              {hasQuoteExpired && (
                <Button
                  className="mt-3 w-full"
                  onClick={requestQuote}
                  variant="secondary"
                >
                  Get a fresh quote
                </Button>
              )}
            </div>
          </>
        )}
      </aside>

      {conversion && (
        <ConversionReceipt
          conversion={conversion}
          onClose={() => {
            setConversion(null);
            setQuote(null);
            setPreviousQuote(null);
            reset();
          }}
        />
      )}
    </section>
  );
}
