import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Ikon info yang membuka tooltip penjelasan pada hover, fokus papan ketik,
 * dan sentuh. Target sentuh 44 px lewat area sentuh pseudo-element.
 */
export function InfoIconButton({
  text,
  label,
  align = "center",
  className,
}: {
  text: string;
  label: string;
  align?: "center" | "right";
  className?: string;
}) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      <button
        type="button"
        aria-label={`Penjelasan ${label}. ${text}`}
        className="relative inline-flex size-11 -m-3 items-center justify-center rounded-full text-ink-muted hover:text-primary-700"
      >
        <Info size={16} aria-hidden="true" />
      </button>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-10 z-20 hidden w-64 rounded-ctl bg-ink px-3 py-2 text-sm font-normal shadow-card leading-5 text-white group-hover:block group-focus-within:block",
          align === "right"
            ? "right-0"
            : "left-1/2 -translate-x-1/2 max-md:left-0 max-md:translate-x-0",
        )}
      >
        {text}
      </span>
    </span>
  );
}

/**
 * Label disertai ikon info yang menampilkan tooltip pada hover/focus.
 * Teks penjelasan ikut dibaca pembaca layar lewat aria-label tombol,
 * sehingga elemen tooltip yang tersembunyi tidak perlu diulang.
 */
export function InfoTooltip({
  label,
  text,
  align = "center",
  className,
}: {
  label: string;
  text: string;
  align?: "center" | "right";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted",
        className,
      )}
    >
      <span>{label}</span>
      <InfoIconButton text={text} label={label} align={align} />
    </span>
  );
}
