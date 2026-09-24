import { CURRENCIES, DECIMAL_PLACES } from "@/constants/currencies";

describe("currencies", () => {
  it("lists the five supported currencies", () => {
    expect(CURRENCIES).toEqual(["NGN", "USD", "GBP", "EUR", "JPY"]);
  });

  it("gives JPY zero decimal places and the others two", () => {
    expect(DECIMAL_PLACES.JPY).toBe(0);
    expect(DECIMAL_PLACES.USD).toBe(2);
    expect(DECIMAL_PLACES.NGN).toBe(2);
  });
});
