import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BarisBilah = {
  label: string;
  sublabel?: string;
  ikon?: ReactNode;
  /** Angka yang ditampilkan di kolom kanan. */
  teks: string;
  /** Lebar bilah 0–100 (%). */
  lebar: number;
  tone?: "primary" | "naik" | "turun";
  /** Bila ada, seluruh baris menjadi tautan. */
  href?: string;
  /** Tandai baris yang sedang dipilih (latar hijau muda). */
  aktif?: boolean;
};

const toneBar: Record<NonNullable<BarisBilah["tone"]>, string> = {
  primary: "bg-primary-600",
  naik: "bg-naik",
  turun: "bg-turun",
};

const gridBaris =
  "grid grid-cols-[minmax(7rem,190px)_1fr_56px] items-center gap-x-3 rounded-ctl px-1 py-1";

/**
 * Bilah horizontal tiga kolom: label (maks 190 px) | bilah 14 px | angka 56 px.
 * Dipakai untuk peringkat volatilitas, paling naik/turun, dan kenaikan per periode.
 */
export function HBarList({
  items,
  ariaLabel,
  className,
}: {
  items: BarisBilah[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <ol aria-label={ariaLabel} className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item.label}>
          {item.href ? (
            <a
              href={item.href}
              className={cn(
                gridBaris,
                "hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-500",
                item.aktif && "bg-primary-50",
              )}
            >
              <IsiBaris item={item} />
            </a>
          ) : (
            <div className={cn(gridBaris, item.aktif && "bg-primary-50")}>
              <IsiBaris item={item} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function IsiBaris({ item }: { item: BarisBilah }) {
  return (
    <>
      <div className="flex min-w-0 items-center gap-2.5">
        {item.ikon}
        <div className="min-w-0">
          <p className="truncate text-base font-medium leading-6 text-ink">{item.label}</p>
          {item.sublabel ? (
            <p className="truncate text-sm leading-5 text-ink-muted">{item.sublabel}</p>
          ) : null}
        </div>
      </div>
      <div
        role="progressbar"
        aria-label={`${item.label}: ${item.teks}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(item.lebar)}
        className="h-[14px] w-full overflow-hidden rounded bg-line"
      >
        <div
          className={cn("h-full rounded", toneBar[item.tone ?? "primary"])}
          style={{ width: `${Math.max(2, Math.min(100, item.lebar))}%` }}
        />
      </div>
      <span
        className={cn(
          "text-right text-base font-semibold tabular-nums",
          item.tone === "naik" ? "text-naik" : item.tone === "turun" ? "text-turun" : "text-ink",
        )}
      >
        {item.teks}
      </span>
    </>
  );
}
