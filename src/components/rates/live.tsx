"use client";

import { useMemo, useState } from "react";

import {
  CURRENCIES,
  CURRENCY_NAMES,
  CURRENCY_SYMBOLS,
  type CurrencyCode,
} from "@/constants/currencies";
import { RATE_STALE_AFTER_MS } from "@/constants/timings";
import { useCurrentTime } from "@/hooks/use-current-time";
import { useRateHistory } from "@/hooks/use-rate-history";
import { useRates } from "@/hooks/use-rates";
import { RateSparkline } from "@/components/rates/sparkline";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Select } from "@/components/ui/select";
import { classNames } from "@/utils/class-names";
import {
  formatRate,
  formatRelativeTime,
} from "@/utils/format";

type RateMovement = "up" | "down" | "same";

type RateDirection = {
  movement: RateMovement;
  changePercent: number;
};

const RATE_DIRECTION_STYLE: Record<
  RateMovement,
  { label: string; className: string; icon: IconName }
> = {
  up: {
    label: "Up",
    className: "text-green",
    icon: "arrow-up",
  },
  down: {
    label: "Down",
    className: "text-red",
    icon: "arrow-down",
  },
  same: {
    label: "Unchanged",
    className: "text-muted",
    icon: "minus",
  },
};

function toRateMinorUnits(rate: string): bigint {
  return BigInt(rate.replace(".", ""));
}

function getRateDirection(
  previousRate: string | undefined,
  currentRate: string | undefined,
): RateDirection {
  if (!previousRate || !currentRate) {
    return { movement: "same", changePercent: 0 };
  }

  const previousMinor = toRateMinorUnits(previousRate);
  const currentMinor = toRateMinorUnits(currentRate);
  const changePercent =
    previousMinor === 0n
      ? 0
      : (Number(currentMinor - previousMinor) / Number(previousMinor)) * 100;

  return {
    changePercent,
    movement:
      currentMinor > previousMinor
        ? "up"
        : currentMinor < previousMinor
          ? "down"
          : "same",
  };
}

function RateDirection({
  direction,
}: {
  direction: RateDirection;
}) {
  const style = RATE_DIRECTION_STYLE[direction.movement];

  return (
    <span
      aria-label={`${style.label} since the last update`}
      className={classNames("inline-flex", style.className)}
      title={style.label}
    >
      <Icon name={style.icon} size={16} strokeWidth={2.2} />
    </span>
  );
}

function RatesTable({
  baseCurrency,
  snapshot,
  skipFailedPoll,
  visibleCurrencies,
  rateDirections,
}: {
  baseCurrency: CurrencyCode;
  snapshot: NonNullable<ReturnType<typeof useRates>["data"]>;
  skipFailedPoll: boolean;
  visibleCurrencies: CurrencyCode[];
  rateDirections: Partial<Record<CurrencyCode, RateDirection>>;
}) {
  const rateHistory = useRateHistory(baseCurrency, snapshot, skipFailedPoll);

  return (
    <div className="divide-y divide-line">
      {visibleCurrencies.map((currency) => {
        const rate = snapshot.rates[currency];
        const direction = rateDirections[currency] ?? {
          movement: "same" as const,
          changePercent: 0,
        };

        return (
          <div
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 sm:px-6"
            key={currency}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted text-sm font-semibold text-ink-soft">
                {CURRENCY_SYMBOLS[currency]}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">
                  {baseCurrency}/{currency}
                </p>
                <p className="truncate text-[11px] text-muted">
                  {CURRENCY_NAMES[currency]}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              {rate ? (
                <span
                  className={classNames(
                    RATE_DIRECTION_STYLE[direction.movement].className,
                  )}
                >
                  <RateSparkline
                    label={`${baseCurrency} to ${currency} over recent updates`}
                    rates={rateHistory[currency] ?? [rate]}
                  />
                </span>
              ) : null}
              <p className="money text-[15px] font-semibold tabular-nums text-ink">
                {rate ? formatRate(rate) : "—"}
              </p>
              <RateDirection direction={direction} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LiveRates({
  isPreview = false,
  onViewAll,
}: {
  isPreview?: boolean;
  onViewAll?: () => void;
}) {
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>("USD");
  const ratesQuery = useRates(baseCurrency);
  const currentTimeMs = useCurrentTime();

  const rateDirections = useMemo(() => {
    const snapshot = ratesQuery.data;
    const previous = snapshot?.previousRates;
    if (!snapshot || !previous) return {};

    const nextDirections: Partial<Record<CurrencyCode, RateDirection>> = {};
    for (const currency of CURRENCIES) {
      nextDirections[currency] = getRateDirection(
        previous[currency],
        snapshot.rates[currency],
      );
    }
    return nextDirections;
  }, [ratesQuery.data]);

  const isStale = ratesQuery.data
    ? currentTimeMs - new Date(ratesQuery.data.timestamp).getTime() >
      RATE_STALE_AFTER_MS
    : false;
  const visibleCurrencies = CURRENCIES.filter(
    (currency) => currency !== baseCurrency,
  ).slice(0, isPreview ? 4 : undefined);

  return (
    <section aria-labelledby="rates-heading" className="surface overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <h2
            id="rates-heading"
            className="text-base font-semibold tracking-[-0.02em] text-ink"
          >
            {isPreview ? "Live rates" : "Rates"}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {ratesQuery.data
              ? `Updated ${formatRelativeTime(ratesQuery.data.timestamp, currentTimeMs)}`
              : "Fetching the latest rates…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Base currency"
            defaultValue="USD"
            label="Base"
            onChange={(event) =>
              setBaseCurrency(event.target.value as CurrencyCode)
            }
          >
            {CURRENCIES.map((currency) => (
              <option value={currency} key={currency}>
                {currency}
              </option>
            ))}
          </Select>
          {!isPreview && (
            <Button
              aria-label="Refresh rates"
              onClick={() => ratesQuery.refetch()}
              variant="icon"
            >
              <Icon
                className={ratesQuery.isFetching ? "animate-spin" : ""}
                name="refresh"
                size={16}
              />
            </Button>
          )}
        </div>
      </div>

      {(isStale || (ratesQuery.isError && ratesQuery.data)) && (
        <div className="flex items-center gap-2 border-b border-amber/30 bg-amber-soft px-5 py-2.5 text-xs text-amber sm:px-6">
          <Icon name="info" size={15} />
          Showing the last good rates. We&apos;re retrying automatically.
        </div>
      )}

      {ratesQuery.isLoading ? (
        <div className="divide-y divide-line px-5 sm:px-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="flex animate-pulse items-center justify-between py-4"
              key={index}
            >
              <div className="h-8 w-28 rounded bg-surface-muted" />
              <div className="h-5 w-24 rounded bg-surface-muted" />
            </div>
          ))}
        </div>
      ) : ratesQuery.data ? (
        <RatesTable
          baseCurrency={baseCurrency}
          key={baseCurrency}
          rateDirections={rateDirections}
          skipFailedPoll={ratesQuery.isError}
          snapshot={ratesQuery.data}
          visibleCurrencies={visibleCurrencies}
        />
      ) : (
        <div className="px-5 py-10 text-center sm:px-6">
          <p className="text-sm font-medium text-ink">
            Rates are temporarily unavailable
          </p>
          <p className="mt-1 text-xs text-muted">
            We&apos;ll keep trying in the background.
          </p>
          <Button
            className="mt-4"
            onClick={() => ratesQuery.refetch()}
            variant="ghost"
          >
            Try now
          </Button>
        </div>
      )}

      {isPreview && onViewAll && (
        <div className="border-t border-line px-5 py-3 sm:px-6">
          <Button className="text-xs" onClick={onViewAll} variant="ghost">
            View all rates <Icon name="chevron" size={14} />
          </Button>
        </div>
      )}
    </section>
  );
}
