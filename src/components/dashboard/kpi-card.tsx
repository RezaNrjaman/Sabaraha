import { Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { Chip, SimulationChip } from "@/components/ui/status-chip";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  tone = "primary",
  footer,
  tooltip,
  simulation = false,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "naik" | "turun" | "seimbang" | "perhatian";
  footer?: ReactNode;
  tooltip?: string;
  simulation?: boolean;
}) {
  const iconTone = {
    primary: "bg-primary-100 text-primary-700",
    naik: "bg-naik-bg text-naik",
    turun: "bg-turun-bg text-turun",
    seimbang: "bg-seimbang-bg text-seimbang",
    perhatian: "bg-perhatian-bg text-perhatian",
  }[tone];

  return (
    <Card className="relative overflow-visible">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-ink-muted">{label}</p>
            {simulation ? <SimulationChip /> : null}
            {tooltip ? (
              <span className="group relative inline-flex">
                <button
                  type="button"
                  aria-label={`Penjelasan ${label}`}
                  className="inline-flex size-6 items-center justify-center rounded-full text-ink-muted hover:bg-primary-50 hover:text-primary-700"
                >
                  <Info size={14} />
                </button>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-8 z-20 w-64 -translate-x-1/2 rounded-ctl bg-ink px-3 py-2 text-sm font-normal leading-5 text-white opacity-0 shadow-card transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  {tooltip}
                </span>
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[2rem] font-bold leading-10 text-ink">
            {value}
            {unit ? <span className="ml-1 text-base font-medium text-ink-muted">{unit}</span> : null}
          </p>
          {hint ? <p className="mt-1 text-sm text-ink-muted">{hint}</p> : null}
        </div>
        <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-full", iconTone)}>
          <Icon size={22} strokeWidth={1.75} />
        </span>
      </div>
      {footer ? <div className="mt-4 flex flex-wrap items-center gap-2">{footer}</div> : null}
    </Card>
  );
}

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
      <p className="mt-1 text-xl font-bold leading-7 text-ink">{value}</p>
      {hint ? <p className="mt-1 text-sm text-ink-muted">{hint}</p> : null}
    </div>
  );
}

export function TrendChip({
  value,
  label,
}: {
  value: number | null;
  label: string;
}) {
  const status = value === null ? "Stabil" : value >= 1 ? "Naik" : value <= -1 ? "Turun" : "Stabil";
  return (
    <Chip tone={status.toLowerCase() as "naik" | "turun" | "stabil"} className="text-sm">
      {label}
    </Chip>
  );
}
