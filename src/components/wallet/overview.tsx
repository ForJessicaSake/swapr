"use client";

import { useMemo, useState } from "react";

import {
  CURRENCIES,
  CURRENCY_NAMES,
  CURRENCY_SYMBOLS,
  DECIMAL_PLACES,
  type CurrencyCode,
} from "@/constants/currencies";
import { RATE_STALE_AFTER_MS } from "@/constants/timings";
import { useBalances } from "@/hooks/use-balances";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useRates } from "@/hooks/use-rates";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Select } from "@/components/ui/select";
import { classNames } from "@/utils/class-names";
import { formatMoney, formatRelativeTime } from "@/utils/format";
import { convertAmountToDisplayCurrency } from "@/utils/money";

export function WalletOverview({
  onStartConversion,
}: {
  onStartConversion: () => void;
}) {
  const [displayCurrency, setDisplayCurrency] =
    useState<CurrencyCode>("USD");
  const balancesQuery = useBalances();
  const ratesQuery = useRates(displayCurrency);
  const currentTimeMs = useCurrentTime();

  const walletTotals = useMemo(() => {
    const balances = balancesQuery.data?.balances;
    if (!balances) return null;

    const ownBalance =
      balances.find((balance) => balance.currency === displayCurrency)
        ?.amount ?? "0";

    if (!ratesQuery.data) {
      return { headline: ownBalance };
    }

    let headline = 0n;

    for (const balance of balances) {
      if (balance.currency === displayCurrency) {
        headline += BigInt(balance.amount);
        continue;
      }
      const rate = ratesQuery.data.rates[balance.currency];
      if (!rate) continue;
      headline += BigInt(
        convertAmountToDisplayCurrency(
          balance.amount,
          rate,
          DECIMAL_PLACES[balance.currency],
          DECIMAL_PLACES[displayCurrency],
        ),
      );
    }

    return { headline: headline.toString() };
  }, [balancesQuery.data, displayCurrency, ratesQuery.data]);

  const isStale = ratesQuery.data
    ? currentTimeMs - new Date(ratesQuery.data.timestamp).getTime() >
      RATE_STALE_AFTER_MS
    : false;

  if (balancesQuery.isLoading) {
    return (
      <section aria-label="Wallet loading" className="surface animate-pulse p-6">
        <div className="h-4 w-28 rounded bg-surface-muted" />
        <div className="mt-5 h-10 w-56 rounded bg-surface-muted" />
        <div className="mt-8 grid gap-3 sm:grid-cols-5">
          {CURRENCIES.map((currency) => (
            <div className="h-28 rounded-2xl bg-surface-muted" key={currency} />
          ))}
        </div>
      </section>
    );
  }

  if (balancesQuery.isError || !balancesQuery.data || !walletTotals) {
    return (
      <section className="surface p-6" aria-labelledby="wallet-heading">
        <h2 id="wallet-heading" className="text-lg font-semibold">
          Your wallet
        </h2>
        <p className="mt-2 text-sm text-red">
          We couldn&apos;t load your balances.
        </p>
        <Button
          className="mt-4"
          onClick={() => balancesQuery.refetch()}
          variant="ghost"
        >
          Try again
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="wallet-heading" className="surface overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-5 py-5 sm:px-7">
        <div>
          <div className="flex items-center gap-2">
            <h2
              id="wallet-heading"
              className="text-sm font-medium text-ink-soft"
            >
              Total balance
            </h2>
            {isStale && (
              <span className="rounded-full bg-amber-soft px-2 py-0.5 text-[10px] font-semibold text-amber">
                Rates delayed
              </span>
            )}
          </div>
          <p className="money mt-2 text-[34px] font-semibold tracking-[-0.05em] text-ink sm:text-[40px]">
            {formatMoney(walletTotals.headline, displayCurrency)}
          </p>
          <p className="mt-1.5 text-xs text-muted">
            {ratesQuery.data
              ? `Worth in ${displayCurrency} · updated ${formatRelativeTime(ratesQuery.data.timestamp, currentTimeMs)}`
              : `Showing your ${displayCurrency} balance until rates load`}
          </p>
        </div>
        <Select
          aria-label="Portfolio display currency"
          defaultValue="USD"
          label="Display in"
          onChange={(event) =>
            setDisplayCurrency(event.target.value as CurrencyCode)
          }
        >
          {CURRENCIES.map((currency) => (
            <option value={currency} key={currency}>
              {currency}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-5">
        {balancesQuery.data.balances.map((balance) => {
          const isEmpty = BigInt(balance.amount) === 0n;

          return (
            <article
              className={classNames(
                "balance-tile rounded-2xl border border-line bg-surface-muted p-4",
                isEmpty && "opacity-80",
              )}
              key={balance.currency}
            >
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-full bg-surface text-sm font-semibold text-blue shadow-[0_1px_2px_rgb(16_24_40_/_6%)]">
                  {CURRENCY_SYMBOLS[balance.currency]}
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold tracking-wide text-ink-soft">
                {balance.currency}
              </p>
              <p className="money mt-1 truncate text-[15px] font-semibold text-ink">
                {formatMoney(balance.amount, balance.currency)}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-muted">
                {CURRENCY_NAMES[balance.currency]}
              </p>
            </article>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 border-t border-line bg-surface-muted px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <p className="text-sm text-ink-soft">
          Move money between balances at a locked rate.
        </p>
        <Button className="sm:min-w-[200px]" onClick={onStartConversion}>
          Convert currency
          <Icon name="chevron" size={17} />
        </Button>
      </div>
    </section>
  );
}
