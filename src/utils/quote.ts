export function getQuoteRemainingMs(
  expiresAt: string,
  serverTime: string,
  currentTimeMs: number,
  clientReceivedAt = currentTimeMs,
): number {
  const serverOffset = new Date(serverTime).getTime() - clientReceivedAt;
  const estimatedServerNow = currentTimeMs + serverOffset;
  return Math.max(0, new Date(expiresAt).getTime() - estimatedServerNow);
}

export function isQuoteExpired(
  expiresAt: string,
  serverTime: string,
  currentTimeMs: number,
  clientReceivedAt = currentTimeMs,
): boolean {
  return (
    getQuoteRemainingMs(
      expiresAt,
      serverTime,
      currentTimeMs,
      clientReceivedAt,
    ) <= 0
  );
}
