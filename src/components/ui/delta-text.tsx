import { ArrowDown, ArrowUp, Minus } from "lucide-react";

import { cn } from "@/lib/utils";

export type DeltaTone = "naik" | "turun" | "stabil";

const toneClasses: Record<DeltaTone, string> = {
  naik: "text-naik",
  turun: "text-turun",
  stabil: "text-stabil",
};

export function deltaTone(value: number | null | undefined): DeltaTone {
  if (value === null || value === undefined || Number.isNaN(value)) return "stabil";
  if (value >= 1) return "naik";
  if (value <= -1) return "turun";
  return "stabil";
}

/**
 * Baris perubahan: ikon panah SVG + angka + pembanding waktu.
 * Naik = merah, turun = hijau, stabil = abu (makna warna desain.md).
 */
export function DeltaText({
  value,
  label,
  angka,
  tone,
  className,
}: {
  /** Perubahan dalam persen; menentukan warna dan panah. */
  value: number | null;
  /** Pembanding waktu, mis. "dibanding bulan lalu". */
  label: string;
  /** Tampilan angka alternatif; bila kosong memakai value dengan tanda persen. */
  angka?: string;
  tone?: DeltaTone;
  className?: string;
}) {
  const nada = tone ?? deltaTone(value);
  const Icon = nada === "naik" ? ArrowUp : nada === "turun" ? ArrowDown : Minus;
  const teks =
    angka ??
    (value === null || Number.isNaN(value)
      ? "–"
      : `${new Intl.NumberFormat("id-ID", {
          maximumFractionDigits: 1,
          signDisplay: "exceptZero",
        }).format(value)}%`);

  return (
    <span
      className={cn(
        "inline-flex items-start gap-1 text-sm font-medium leading-5 tabular-nums",
        toneClasses[nada],
        className,
      )}
    >
      <Icon size={16} strokeWidth={2.25} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>
        <span className="font-semibold">{teks}</span>{" "}
        <span className="font-normal">{label}</span>
      </span>
    </span>
  );
}
