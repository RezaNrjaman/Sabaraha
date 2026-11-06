import { ArrowDown, ArrowUp, Check, Info, Minus, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ChipTone =
  | "naik"
  | "turun"
  | "stabil"
  | "surplus"
  | "seimbang"
  | "defisit"
  | "netral"
  | "primary";

const toneClasses: Record<ChipTone, string> = {
  naik: "bg-naik-bg text-naik",
  turun: "bg-turun-bg text-turun",
  stabil: "bg-stabil-bg text-stabil",
  surplus: "bg-turun-bg text-turun",
  seimbang: "bg-seimbang-bg text-seimbang",
  defisit: "bg-defisit-bg text-defisit",
  netral: "bg-bg text-ink-muted",
  primary: "bg-primary-100 text-primary-700",
};

const statusTone: Record<string, ChipTone> = {
  Naik: "naik",
  Turun: "turun",
  Stabil: "stabil",
  Surplus: "surplus",
  Seimbang: "seimbang",
  Defisit: "defisit",
};

export function Chip({
  children,
  tone = "netral",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: ChipTone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
        toneClasses[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function StatusChip({
  status,
  className,
  compact = false,
}: {
  status: string;
  className?: string;
  /** Tanpa ikon dan hemat ruang, untuk kartu yang sangat sempit. */
  compact?: boolean;
}) {
  const tone = statusTone[status] ?? "netral";
  const Icon =
    status === "Naik"
      ? ArrowUp
      : status === "Turun"
        ? ArrowDown
        : status === "Stabil"
          ? Minus
          : status === "Surplus"
            ? Check
            : status === "Defisit"
              ? TriangleAlert
              : status === "Seimbang"
                ? Minus
                : Info;

  return (
    <Chip
      tone={tone}
      className={cn(compact && "whitespace-nowrap px-2.5", className)}
      icon={compact ? null : <Icon size={14} strokeWidth={2.2} />}
    >
      {status}
    </Chip>
  );
}

export function ProjectionChip({ className }: { className?: string }) {
  return (
    <Chip tone="primary" className={className} icon={<Info size={14} />}>
      Proyeksi
    </Chip>
  );
}

export function ChangeChip({
  value,
  label,
  className,
}: {
  value: number | null;
  label?: string;
  className?: string;
}) {
  const status = value === null ? "Stabil" : value >= 1 ? "Naik" : value <= -1 ? "Turun" : "Stabil";
  const Icon = status === "Naik" ? ArrowUp : status === "Turun" ? ArrowDown : Minus;
  const tone = statusTone[status];

  return (
    <Chip
      tone={tone}
      className={className}
      icon={<Icon size={14} strokeWidth={2.2} />}
    >
      {value === null
        ? "-"
        : `${new Intl.NumberFormat("id-ID", {
            maximumFractionDigits: 1,
            signDisplay: "exceptZero",
          }).format(value)}%`}
      {label ? <span className="font-normal opacity-80">{label}</span> : null}
    </Chip>
  );
}
