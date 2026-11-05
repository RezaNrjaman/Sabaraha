import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Kartu tooltip grafik: putih, tepi tipis, bayangan lembut. */
export function ChartTooltip({
  children,
  className,
  status = false,
  style,
}: {
  children: ReactNode;
  className?: string;
  status?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      role={status ? "status" : undefined}
      style={style}
      className={cn(
        "pointer-events-none z-20 min-w-32 rounded-ctl border border-line bg-surface px-3 py-2 text-sm shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Satu baris isi tooltip: label abu di kiri, nilai tabular di kanan. */
export function TooltipRow({
  label,
  nilai,
  warna,
}: {
  label: string;
  nilai: string;
  warna?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-ink-muted">
        {warna ? (
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-[3px]"
            style={{ backgroundColor: warna }}
          />
        ) : null}
        {label}
      </span>
      <span className="font-semibold tabular-nums text-ink">{nilai}</span>
    </div>
  );
}
