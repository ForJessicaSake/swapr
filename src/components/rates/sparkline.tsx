import { sparklinePath } from "@/utils/sparkline";

export function RateSparkline({
  rates,
  label,
}: {
  rates: string[];
  label: string;
}) {
  const width = 64;
  const height = 22;
  const path = sparklinePath(rates, width, height);

  return (
    <svg
      aria-label={label}
      className="shrink-0 text-current"
      height={height}
      overflow="visible"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      {path ? (
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      ) : null}
    </svg>
  );
}
