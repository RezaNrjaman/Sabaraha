import { cn } from "@/lib/utils";

/** Grafik mini di dalam sel tabel: garis tipis + titik terakhir. */
export function SparklineMini({
  data,
  width = 112,
  height = 36,
  className,
  label = "Grafik mini harga",
}: {
  data: Array<{ tanggal: string; harga: number }>;
  width?: number;
  height?: number;
  className?: string;
  label?: string;
}) {
  if (data.length < 2) {
    return (
      <span
        className={cn("text-sm text-ink-muted", className)}
        aria-label="Data grafik mini belum cukup"
      >
        –
      </span>
    );
  }

  const values = data.map((point) => point.harga);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const padding = 3;
  const points = data
    .map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((point.harga - min) / span) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const naik = values[values.length - 1] >= values[0];
  const stroke = naik ? "stroke-naik" : "stroke-turun";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${label}: ${data.length} titik, arah ${naik ? "naik" : "turun"}`}
      className={cn("overflow-visible", className)}
    >
      <polyline
        fill="none"
        className={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle
        cx={width - padding}
        cy={height - padding - ((values[values.length - 1] - min) / span) * (height - padding * 2)}
        r="2.5"
        className={stroke}
      />
    </svg>
  );
}
