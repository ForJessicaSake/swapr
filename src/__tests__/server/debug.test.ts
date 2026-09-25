import { applyDebugAction } from "@/server/debug";
import { debugFlags, getBalance, resetStore } from "@/server/store";

describe("debug actions", () => {
  beforeEach(() => {
    resetStore();
  });

  it("toggles a rates outage", () => {
    expect(applyDebugAction("rates-outage")).toEqual({
      forceRatesOutage: true,
    });
    expect(debugFlags.forceRatesOutage).toBe(true);
    expect(applyDebugAction("rates-outage")).toEqual({
      forceRatesOutage: false,
    });
  });

  it("arms the next conversion to expire", () => {
    expect(applyDebugAction("expire-next-quote")).toEqual({
      forceNextQuoteExpired: true,
    });
  });

  it("resets balances and flags", () => {
    debugFlags.forceRatesOutage = true;
    applyDebugAction("reset-balances");
    expect(getBalance("USD")).toBe(250075n);
    expect(debugFlags.forceRatesOutage).toBe(false);
    expect(debugFlags.forceNextQuoteExpired).toBe(false);
  });
});
