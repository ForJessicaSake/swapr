import {
  applySpread,
  calculateFee,
  convertAmountToDisplayCurrency,
  convertBuyToSell,
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

  it("converts sell to buy with integer minor units", () => {
    expect(convertSellToBuy("10000", "1524.78900000", 2, 2)).toBe("15247890");
  });

  it("converts buy to sell rounding the sell amount up", () => {
    expect(convertBuyToSell("15247890", "1524.78900000", 2, 2)).toBe("10000");
  });

  it("converts JPY with zero decimal places", () => {
    expect(convertSellToBuy("10000", "147.82000000", 2, 0)).toBe("14782");
  });

  it("values a foreign balance in the display currency", () => {
    expect(
      convertAmountToDisplayCurrency("15324512", "1532.45120000", 2, 2),
    ).toBe("10000");
  });
});
