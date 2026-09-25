import { decimalToScaled } from "@/utils/money";

export const RATE_HISTORY_LIMIT = 36;

export function sparklinePath(
  rates: string[],
  width: number,
  height: number,
): string {
  if (rates.length === 0) return "";

  const scaled = rates.map(decimalToScaled);
  let min = scaled[0];
  let max = scaled[0];
  for (const value of scaled) {
    if (value < min) min = value;
    if (value > max) max = value;
  }

  const range = max - min;
  const lastIndex = Math.max(scaled.length - 1, 1);

  return scaled
    .map((value, index) => {
      const x = (index * width) / lastIndex;
      const y =
        range === 0n
          ? height / 2
          : Number(((max - value) * BigInt(height)) / range);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}
