import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

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
        "group relative inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted",
        className,
      )}
    >
      <span>{label}</span>
      <button
        type="button"
        aria-label={`Penjelasan ${label}. ${text}`}
        className="relative inline-flex size-6 shrink-0 items-center justify-center rounded-full text-ink-muted after:absolute after:-inset-2.5 after:content-[''] hover:bg-primary-50 hover:text-primary-700"
      >
        <Info size={14} />
      </button>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-8 z-20 w-64 rounded-ctl bg-ink px-3 py-2 text-sm font-normal leading-5 text-white opacity-0 shadow-card transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
          align === "right" ? "right-0" : "left-1/2 -translate-x-1/2",
        )}
      >
        {text}
      </span>
    </span>
  );
}
