import { getQuoteRemainingMs, isQuoteExpired } from "@/utils/quote";

describe("quote expiry", () => {
  const serverTime = "2026-09-24T10:15:05.000Z";
  const expiresAt = "2026-09-24T10:15:35.000Z";
  const clientReceivedAt = new Date("2026-09-24T09:15:05.000Z").getTime();

  it("measures remaining time using the server clock offset", () => {
    const tenSecondsLater = clientReceivedAt + 10_000;
    expect(
      getQuoteRemainingMs(
        expiresAt,
        serverTime,
        tenSecondsLater,
        clientReceivedAt,
      ),
    ).toBe(20_000);
  });

  it("is still live before the server expiry time", () => {
    expect(
      isQuoteExpired(
        expiresAt,
        serverTime,
        clientReceivedAt + 29_000,
        clientReceivedAt,
      ),
    ).toBe(false);
  });

  it("treats a quote as expired after the server expiry time", () => {
    expect(
      isQuoteExpired(
        expiresAt,
        serverTime,
        clientReceivedAt + 30_000,
        clientReceivedAt,
      ),
    ).toBe(true);
  });
});
