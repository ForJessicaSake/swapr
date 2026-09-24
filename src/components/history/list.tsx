"use client";

import { useState } from "react";

import { ConversionReceipt } from "@/components/history/receipt";
import { useConversions } from "@/hooks/use-conversions";
import type { Conversion } from "@/types/conversions";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatMoney } from "@/utils/format";

function formatActivityDate(isoDate: string, isPreview = false) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    ...(isPreview ? {} : { year: "numeric" }),
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function ConversionHistory({
  isPreview = false,
  onViewAll,
}: {
  isPreview?: boolean;
  onViewAll?: () => void;
}) {
  const conversionsQuery = useConversions();
  const [selectedConversion, setSelectedConversion] =
    useState<Conversion | null>(null);
  const conversions =
    conversionsQuery.data?.conversions.slice(0, isPreview ? 5 : undefined) ??
    [];

  if (isPreview && !conversionsQuery.isLoading && conversions.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="history-heading" className="surface overflow-hidden">
      <div className="flex items-start justify-between border-b border-line px-5 py-4 sm:px-6">
        <div>
          <h2
            id="history-heading"
            className="text-base font-semibold tracking-[-0.02em] text-ink"
          >
            {isPreview ? "Recent activity" : "Conversion history"}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {isPreview ? "Your latest swaps" : "Newest transactions first"}
          </p>
        </div>
        {!isPreview && conversions.length > 0 && (
          <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-semibold text-ink-soft">
            {conversions.length} completed
          </span>
        )}
      </div>

      {conversionsQuery.isLoading ? (
        <div className="space-y-4 p-5 sm:p-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              className="h-12 animate-pulse rounded-xl bg-surface-muted"
              key={index}
            />
          ))}
        </div>
      ) : conversions.length === 0 ? (
        <div className="px-5 py-8 text-center sm:px-6">
          <p className="text-sm font-semibold text-ink">
            No conversions yet
          </p>
          <p className="mt-1 text-xs text-muted">
            Completed swaps will show up here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {conversions.map((conversion) => (
            <button
              className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 text-left transition hover:bg-surface-muted sm:px-6"
              key={conversion.id}
              onClick={() => setSelectedConversion(conversion)}
              type="button"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-green-soft text-green">
                  <Icon name="swap" size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {conversion.sellCurrency} → {conversion.buyCurrency}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-muted">
                    {formatActivityDate(conversion.createdAt, isPreview)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="money text-sm font-semibold text-ink">
                  +{formatMoney(conversion.buyAmount, conversion.buyCurrency)}
                </p>
                <p className="money mt-1 text-[11px] text-muted">
                  −{formatMoney(conversion.sellAmount, conversion.sellCurrency)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isPreview && onViewAll && conversions.length > 0 && (
        <div className="border-t border-line px-5 py-3 sm:px-6">
          <Button className="text-xs" onClick={onViewAll} variant="ghost">
            View all activity <Icon name="chevron" size={14} />
          </Button>
        </div>
      )}

      {selectedConversion && (
        <ConversionReceipt
          conversion={selectedConversion}
          onClose={() => setSelectedConversion(null)}
        />
      )}
    </section>
  );
}
