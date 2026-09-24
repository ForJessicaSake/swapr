import { debugFlags } from "@/server/store";
import type { DebugAction } from "@/types/debug";

export function applyDebugAction(action: DebugAction) {
  if (action === "rates-outage") {
    debugFlags.forceRatesOutage = true;
  }

  if (action === "expire-next-quote") {
    debugFlags.forceNextQuoteExpired = true;
  }

  if (action === "reset-balances") {
    debugFlags.forceRatesOutage = false;
    debugFlags.forceNextQuoteExpired = false;
  }
}
