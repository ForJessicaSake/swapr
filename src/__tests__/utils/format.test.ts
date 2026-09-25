import {
  formatMinorForInput,
  formatMoney,
  formatRelativeTime,
  parseAmountToMinor,
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

describe("amount input", () => {
  it("strips letters and extra fraction digits", () => {
    expect(sanitizeAmountInput("600hhhyy", 2)).toBe("600");
    expect(sanitizeAmountInput("12.5abc9", 2)).toBe("12.59");
    expect(sanitizeAmountInput("1.234", 2)).toBe("1.23");
    expect(sanitizeAmountInput("150.75", 0)).toBe("150");
  });

  it("parses display amounts into minor units", () => {
    expect(parseAmountToMinor("100.00", 2)).toBe("10000");
    expect(parseAmountToMinor("150", 0)).toBe("150");
    expect(parseAmountToMinor("abc", 2)).toBeNull();
  });

  it("turns minor units back into an input string", () => {
    expect(formatMinorForInput("10050", 2)).toBe("100.5");
    expect(formatMinorForInput("150", 0)).toBe("150");
  });
});

describe("formatRelativeTime", () => {
  const now = Date.parse("2026-09-24T10:15:35.000Z");

  it("says just now, then seconds, then minutes", () => {
    expect(formatRelativeTime("2026-09-24T10:15:32.000Z", now)).toBe("just now");
    expect(formatRelativeTime("2026-09-24T10:15:20.000Z", now)).toBe("15s ago");
    expect(formatRelativeTime("2026-09-24T10:13:35.000Z", now)).toBe("2m ago");
  });
});
