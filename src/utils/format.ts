import type { CurrencyCode } from "@/constants/currencies";
import { DECIMAL_PLACES } from "@/constants/currencies";

export function formatMoney(amountMinor: string, currency: CurrencyCode): string {
  const decimals = DECIMAL_PLACES[currency];
  const divisor = 10n ** BigInt(decimals);
  const amount = BigInt(amountMinor);
  const negative = amount < 0n;
  const absolute = negative ? -amount : amount;
  const whole = absolute / divisor;
  const fraction = absolute % divisor;
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const parts = formatter.formatToParts(whole).map((part) =>
    part.type === "fraction"
      ? { ...part, value: fraction.toString().padStart(decimals, "0") }
      : part,
  );
  const formatted = parts.map((part) => part.value).join("");
  return negative ? `-${formatted}` : formatted;
}

export function formatRate(rate: string): string {
  const value = Number(rate);
  const maximumFractionDigits = value >= 100 ? 2 : value >= 1 ? 4 : 6;
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value);
}

export function formatPercentChange(percent: number): string {
  const absolute = Math.abs(percent);
  const digits = absolute > 0 && absolute < 0.01 ? 3 : 2;
  const formatted = absolute.toFixed(digits);
  if (percent > 0) return `+${formatted}%`;
  if (percent < 0) return `−${formatted}%`;
  return `${formatted}%`;
}

export function formatRelativeTime(
  timestamp: string,
  currentTimeMs = Date.now(),
): string {
  const seconds = Math.max(
    0,
    Math.floor((currentTimeMs - new Date(timestamp).getTime()) / 1_000),
  );
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

export function sanitizeAmountInput(
  value: string,
  decimalPlaces: number,
): string {
  const normalized = value.replace(/,/g, ".");
  let next = "";
  let hasDecimal = false;

  for (const character of normalized) {
    if (character >= "0" && character <= "9") {
      if (hasDecimal) {
        const fraction = next.slice(next.indexOf(".") + 1);
        if (fraction.length >= decimalPlaces) continue;
      }
      next += character;
      continue;
    }

    if (character === "." && decimalPlaces === 0) {
      break;
    }

    if (character === "." && decimalPlaces > 0 && !hasDecimal) {
      hasDecimal = true;
      next += ".";
    }
  }

  return next;
}

export function parseAmountToMinor(
  value: string,
  decimalPlaces: number,
): string | null {
  const normalized = value.replace(/,/g, "").trim();
  if (!/^\d*(\.\d*)?$/.test(normalized) || normalized === "") return null;
  const [whole = "0", fraction = ""] = normalized.split(".");
  if (fraction.length > decimalPlaces) return null;
  const minor = `${whole || "0"}${fraction.padEnd(decimalPlaces, "0")}`.replace(
    /^0+(?=\d)/,
    "",
  );
  return minor || "0";
}

export function formatMinorForInput(
  amountMinor: string,
  decimalPlaces: number,
): string {
  if (decimalPlaces === 0) return amountMinor;
  const padded = amountMinor.padStart(decimalPlaces + 1, "0");
  const whole = padded.slice(0, -decimalPlaces);
  const fraction = padded.slice(-decimalPlaces).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}
