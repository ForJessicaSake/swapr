const RATE_SCALE = 100_000_000n;

export function calculateFee(sellAmount: string): string {
  const amount = BigInt(sellAmount);
  if (amount <= 0n) return "1";
  return ((amount * 5n + 999n) / 1_000n).toString();
}

export function decimalToScaled(value: string): bigint {
  const [whole = "0", fraction = ""] = value.split(".");
  const normalized = `${fraction}00000000`.slice(0, 8);
  return BigInt(whole) * RATE_SCALE + BigInt(normalized);
}

export function scaledToDecimal(value: bigint): string {
  const whole = value / RATE_SCALE;
  const fraction = (value % RATE_SCALE).toString().padStart(8, "0");
  return `${whole}.${fraction}`;
}

export function applySpread(midMarketRate: string): string {
  const scaled = decimalToScaled(midMarketRate);
  return scaledToDecimal((scaled * 995n) / 1_000n);
}

export function convertSellToBuy(
  sellAmount: string,
  rate: string,
  sellDecimals: number,
  buyDecimals: number,
): string {
  const numerator =
    BigInt(sellAmount) *
    decimalToScaled(rate) *
    10n ** BigInt(buyDecimals);
  const denominator = RATE_SCALE * 10n ** BigInt(sellDecimals);
  return (numerator / denominator).toString();
}

export function convertBuyToSell(
  buyAmount: string,
  rate: string,
  sellDecimals: number,
  buyDecimals: number,
): string {
  const numerator =
    BigInt(buyAmount) * RATE_SCALE * 10n ** BigInt(sellDecimals);
  const denominator =
    decimalToScaled(rate) * 10n ** BigInt(buyDecimals);
  return ((numerator + denominator - 1n) / denominator).toString();
}

export function convertAmountToDisplayCurrency(
  amount: string,
  unitsPerBase: string,
  currencyDecimals: number,
  baseDecimals: number,
): string {
  const numerator =
    BigInt(amount) * RATE_SCALE * 10n ** BigInt(baseDecimals);
  const denominator =
    decimalToScaled(unitsPerBase) * 10n ** BigInt(currencyDecimals);
  return (numerator / denominator).toString();
}
