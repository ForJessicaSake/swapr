import type { DebugAction } from "@/types/debug";
import { debugFlags, resetStore } from "@/server/store";

export function applyDebugAction(action: DebugAction) {
  if (action === "rates-outage") {
    debugFlags.forceRatesOutage = !debugFlags.forceRatesOutage;
    return { forceRatesOutage: debugFlags.forceRatesOutage };
  }

  if (action === "expire-next-quote") {
    debugFlags.forceNextQuoteExpired = true;
    return { forceNextQuoteExpired: true };
  }

  resetStore();
  return { reset: true };
}
