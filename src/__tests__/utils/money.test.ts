import {
  applySpread,
  calculateFee,
  convertSellToBuy,
} from "@/utils/money";

describe("money", () => {
  it("charges 0.5% rounded up, with a minimum of 1 minor unit", () => {
    expect(calculateFee("1")).toBe("1");
    expect(calculateFee("201")).toBe("2");
    expect(calculateFee("10000")).toBe("50");
  });

  it("quotes a rate 0.5% worse than the mid-market rate", () => {
    expect(applySpread("100.00000000")).toBe("99.50000000");
    expect(applySpread("1524.78900000")).toBe("1517.16505500");
  });

  it("converts using integer minor units without floating point maths", () => {
    expect(convertSellToBuy("10000", "1524.78900000", 2, 2)).toBe(
      "15247890",
    );
    expect(typeof convertSellToBuy("10000", "1524.78900000", 2, 2)).toBe(
      "string",
    );
  });
});
