import { formatPersen } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RangeBar({
  min,
  median,
  max,
  className,
}: {
  min: number;
  median: number;
  max: number;
  className?: string;
}) {
  const span = max - min || 1;
  const posisi = Math.min(100, Math.max(0, ((median - min) / span) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-3 rounded-full bg-line">
        <div className="absolute inset-y-0 left-0 w-full rounded-full bg-gradient-to-r from-turun/30 via-kunyit/50 to-naik/30" />
        <span
          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-primary-600 shadow"
          style={{ left: `${posisi}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-2 flex justify-between gap-2 text-sm text-ink-muted">
        <span>{formatPersen(min)}</span>
        <span className="font-semibold text-ink">{formatPersen(median)}</span>
        <span>{formatPersen(max)}</span>
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  max,
  tone = "primary",
  label,
}: {
  value: number;
  max: number;
  tone?: "primary" | "naik" | "turun" | "seimbang";
  label: string;
}) {
  const lebar = max > 0 ? Math.min(100, Math.max(4, (Math.abs(value) / max) * 100)) : 4;
  const warna = {
    primary: "bg-primary-500",
    naik: "bg-naik",
    turun: "bg-turun",
    seimbang: "bg-seimbang",
  }[tone];

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-line/80"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(lebar)}
    >
      <div className={cn("h-full rounded-full", warna)} style={{ width: `${lebar}%` }} />
    </div>
  );
}
