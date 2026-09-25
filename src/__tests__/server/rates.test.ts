import { getLiveRates, getMidMarketRate } from "@/server/rates";
import { debugFlags, resetStore } from "@/server/store";
import { decimalToScaled, scaledToDecimal } from "@/utils/money";

describe("mid-market rates", () => {
  beforeEach(() => {
    resetStore();
  });

  it("quotes USD pairs from integer scaled rates", () => {
    expect(getMidMarketRate("USD", "NGN")).toBe("1532.45120000");
    expect(getMidMarketRate("USD", "JPY")).toBe("147.82000000");
  });

  it("crosses non-USD pairs without floating point money maths", () => {
    expect(getMidMarketRate("EUR", "USD")).toBe(
      scaledToDecimal(
        (100_000_000n * 100_000_000n) / decimalToScaled("0.85430000"),
      ),
    );
  });

  it("returns 503-style failure when a rates outage is forced", () => {
    debugFlags.forceRatesOutage = true;
    expect(() => getLiveRates("USD")).toThrow("RATES_UNAVAILABLE");
  });

  it("returns a full board that excludes the base currency", () => {
    const random = jest.spyOn(Math, "random").mockReturnValue(0.5);
    const payload = getLiveRates("USD");
    random.mockRestore();

    expect(payload.base).toBe("USD");
    expect(payload.rates.USD).toBeUndefined();
    expect(payload.rates.NGN).toEqual(expect.any(String));
    expect(payload.previousRates?.NGN).toEqual(expect.any(String));
  });
});
