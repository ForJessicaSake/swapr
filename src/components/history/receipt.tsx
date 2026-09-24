"use client";

import { useState } from "react";

import type { Conversion } from "@/types/conversions";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { formatMoney, formatRate } from "@/utils/format";

function formatConversionDate(isoDate: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function ConversionReceipt({
  conversion,
  onClose,
}: {
  conversion: Conversion;
  onClose: () => void;
}) {
  const [hasCopiedReference, setHasCopiedReference] = useState(false);

  const copyConversionReference = async () => {
    await navigator.clipboard.writeText(conversion.id);
    setHasCopiedReference(true);
    window.setTimeout(() => setHasCopiedReference(false), 1_500);
  };

  return (
    <Modal
      eyebrow={<p className="text-xs font-medium text-green">Completed</p>}
      footer={
        <Button className="w-full" onClick={onClose} variant="ink">
          Done
        </Button>
      }
      onClose={onClose}
      open
      title="Conversion receipt"
      titleId="receipt-title"
    >
      <div className="rounded-2xl bg-blue-soft p-5">
        <p className="text-xs font-medium text-ink-soft">You received</p>
        <p className="money mt-2 text-3xl font-semibold text-ink">
          {formatMoney(conversion.buyAmount, conversion.buyCurrency)}
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          From {formatMoney(conversion.sellAmount, conversion.sellCurrency)}
        </p>
      </div>

      <dl className="mt-7 divide-y divide-line">
        <div className="flex justify-between gap-4 py-3.5">
          <dt className="text-sm text-ink-soft">Pair</dt>
          <dd className="text-sm font-semibold text-ink">
            {conversion.sellCurrency} → {conversion.buyCurrency}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-3.5">
          <dt className="text-sm text-ink-soft">Rate</dt>
          <dd className="money text-sm font-semibold text-ink">
            1 {conversion.sellCurrency} = {formatRate(conversion.rate)}{" "}
            {conversion.buyCurrency}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-3.5">
          <dt className="text-sm text-ink-soft">Fee</dt>
          <dd className="money text-sm font-semibold text-ink">
            {formatMoney(conversion.fee.amount, conversion.fee.currency)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-3.5">
          <dt className="text-sm text-ink-soft">Date</dt>
          <dd className="text-right text-sm font-semibold text-ink">
            {formatConversionDate(conversion.createdAt)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-3.5">
          <dt className="text-sm text-ink-soft">Reference</dt>
          <dd>
            <Button
              className="gap-1.5"
              onClick={copyConversionReference}
              variant="ghost"
            >
              {conversion.id}
              <Icon name={hasCopiedReference ? "check" : "copy"} size={15} />
              <span className="sr-only">
                {hasCopiedReference ? "Copied" : "Copy reference"}
              </span>
            </Button>
          </dd>
        </div>
      </dl>
    </Modal>
  );
}
