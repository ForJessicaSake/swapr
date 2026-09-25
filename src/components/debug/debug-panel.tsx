"use client";

import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { postDebugAction } from "@/lib/api/debug";
import type { DebugAction } from "@/types/debug";

export function DebugPanel() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [ratesOutage, setRatesOutage] = useState(false);
  const [expireArmed, setExpireArmed] = useState(false);
  const [busyAction, setBusyAction] = useState<DebugAction | null>(null);

  if (searchParams.get("debug") !== "1") {
    return null;
  }

  const runAction = async (action: DebugAction) => {
    setBusyAction(action);
    try {
      const result = await postDebugAction(action);
      if (action === "rates-outage") {
        setRatesOutage(Boolean(result.forceRatesOutage));
      }
      if (action === "expire-next-quote") {
        setExpireArmed(true);
      }
      if (action === "reset-balances") {
        setRatesOutage(false);
        setExpireArmed(false);
      }
      await queryClient.invalidateQueries();
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <aside
      aria-label="Reviewer tools"
      className="fixed right-4 bottom-20 z-40 lg:bottom-5"
    >
      {open && (
        <div className="mb-3 w-[290px] rounded-2xl border border-line bg-surface p-4 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Reviewer tools
              </h2>
              <p className="mt-1 text-[11px] text-muted">
                Force the failure paths the brief asks us to handle.
              </p>
            </div>
            <Button
              aria-label="Close reviewer tools"
              className="size-8 min-h-0 border-0"
              onClick={() => setOpen(false)}
              variant="icon"
            >
              <Icon name="close" size={17} />
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            <Button
              className="w-full justify-start"
              disabled={busyAction !== null}
              onClick={() => void runAction("rates-outage")}
              variant="secondary"
            >
              {ratesOutage ? "Clear rates outage" : "Force rates outage"}
            </Button>
            <Button
              className="w-full justify-start"
              disabled={busyAction !== null}
              onClick={() => void runAction("expire-next-quote")}
              variant="secondary"
            >
              {expireArmed
                ? "Next confirm will expire"
                : "Expire next conversion"}
            </Button>
            <Button
              className="w-full justify-start"
              disabled={busyAction !== null}
              onClick={() => void runAction("reset-balances")}
              variant="secondary"
            >
              Reset balances
            </Button>
          </div>
        </div>
      )}
      <Button
        className="rounded-full shadow-lg"
        onClick={() => setOpen((value) => !value)}
        size="sm"
        variant="ink"
      >
        <Icon name="info" size={15} />
        Reviewer tools
      </Button>
    </aside>
  );
}
