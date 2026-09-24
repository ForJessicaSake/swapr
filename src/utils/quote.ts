export function getQuoteRemainingMs(
  expiresAt: string,
  serverTime: string,
  now: number,
): number {
  throw new Error(
    `Not implemented: getQuoteRemainingMs(${expiresAt}, ${serverTime}, ${now})`,
  );
}

export function isQuoteExpired(
  expiresAt: string,
  serverTime: string,
  now: number,
): boolean {
  throw new Error(
    `Not implemented: isQuoteExpired(${expiresAt}, ${serverTime}, ${now})`,
  );
}
