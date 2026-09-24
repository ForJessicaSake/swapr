import {
  formatMoney,
  formatPercentChange,
  sanitizeAmountInput,
} from "@/utils/format";

describe("formatMoney", () => {
  it("formats JPY with 0 decimal places", () => {
    expect(formatMoney("150000", "JPY")).toBe("JP¥150,000");
  });

  it("formats currencies with minor units to 2 decimal places", () => {
    expect(formatMoney("125050", "NGN")).toBe("₦1,250.50");
    expect(formatMoney("250075", "USD")).toBe("US$2,500.75");
    expect(formatMoney("48020", "EUR")).toBe("€480.20");
  });
});

describe("formatPercentChange", () => {
  it("keeps up, down, and unchanged readable", () => {
    expect(formatPercentChange(0.14)).toBe("+0.14%");
    expect(formatPercentChange(-0.08)).toBe("−0.08%");
    expect(formatPercentChange(0)).toBe("0.00%");
  });
});

describe("sanitizeAmountInput", () => {
  it("strips letters and keeps a valid money amount", () => {
    expect(sanitizeAmountInput("600hhhyy", 2)).toBe("600");
    expect(sanitizeAmountInput("12.5abc9", 2)).toBe("12.59");
    expect(sanitizeAmountInput("1.234", 2)).toBe("1.23");
    expect(sanitizeAmountInput("150.75", 0)).toBe("150");
  });
});
