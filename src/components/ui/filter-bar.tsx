import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Bilah kontrol (filter): kartu berisi grup-grup pilihan yang rapi sejajar
 * dan terbungkus (flex-wrap), dengan label 14 px di atas tiap pilihan,
 * tombol atur ulang di kanan atas, dan baris meta di dasar kartu.
 */
export function FilterBar({
  children,
  reset,
  meta,
  label = "Saringan data",
  className,
}: {
  children: ReactNode;
  /** Tautan "Atur ulang filter", diletakkan di dalam kartu agar tidak melayang. */
  reset?: ReactNode;
  /** Baris keterangan di dasar kartu (rentang tanggal, jumlah titik data). */
  meta?: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div role="group" aria-label={label} className="flex flex-wrap items-start gap-x-6 gap-y-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-6 gap-y-5">{children}</div>
        {reset ? <div className="shrink-0">{reset}</div> : null}
      </div>
      {meta ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-sm text-ink-muted">
          {meta}
        </div>
      ) : null}
    </Card>
  );
}

/** Satu kelompok pilihan: label 14 px di atas, pilihan, lalu petunjuk abu. */
export function FilterGroup({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 flex-1 basis-64", className)}>
      <p className="mb-2 text-sm font-semibold leading-5 text-ink">{label}</p>
      {children}
      {hint ? <p className="mt-2 text-sm leading-5 text-ink-muted">{hint}</p> : null}
    </div>
  );
}
