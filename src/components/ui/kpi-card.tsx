import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { DeltaText, type DeltaTone } from "@/components/ui/delta-text";
import { InfoIconButton } from "@/components/ui/info-tooltip";
import { cn } from "@/lib/utils";

/**
 * Satu anatomi kartu KPI untuk semua halaman:
 * judul (600) → baris acuan abu → nilai besar + satuan → chip status →
 * baris perubahan berpanah → sparkline (atau ruang tinggi yang sama).
 */
export function KpiCard({
  title,
  value,
  unit,
  reference,
  chip,
  delta,
  sparkline,
  tooltip,
  icon: Icon,
  className,
}: {
  title: string;
  value: ReactNode;
  unit?: string;
  /** Baris acuan kecil abu, mis. "Dibanding rata-rata 12 bulan". */
  reference?: string;
  chip?: ReactNode;
  /** Baris perubahan "dibanding bulan lalu" berpanah. */
  delta?: { value: number | null; label: string; angka?: string; tone?: DeltaTone };
  /** Sparkline deret waktu; bila kosong dipakai tinggi minimum yang sama. */
  sparkline?: ReactNode;
  tooltip?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1">
          <h3 className="text-sm font-semibold leading-5 text-ink">{title}</h3>
          {tooltip ? <InfoIconButton text={tooltip} label={title} className="-mr-2" /> : null}
        </div>
        {Icon ? (
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-100 text-primary-700"
          >
            <Icon size={20} strokeWidth={1.75} />
          </span>
        ) : null}
      </div>

      {reference ? (
        <p className="mt-1 text-sm leading-5 text-ink-muted">{reference}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-[1.75rem] font-bold leading-9 tabular-nums text-ink sm:text-[2rem] sm:leading-10">
          {value}
          {unit ? (
            <span className="ml-1 text-sm font-medium text-ink-muted">{unit}</span>
          ) : null}
        </p>
        {chip}
      </div>

      {delta ? (
        <div className="mt-1.5">
          <DeltaText value={delta.value} label={delta.label} angka={delta.angka} tone={delta.tone} />
        </div>
      ) : null}

      <div className="mt-auto pt-4">{sparkline ?? <div className="h-14" aria-hidden="true" />}</div>
    </Card>
  );
}

/** Angka ringkasan kecil (label abu + nilai besar). */
export function Metric({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-sm font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-xl font-bold leading-7 tabular-nums text-ink">{value}</p>
      {hint ? <p className="mt-1 text-sm text-ink-muted">{hint}</p> : null}
    </div>
  );
}
