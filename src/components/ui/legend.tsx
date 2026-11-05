import { cn } from "@/lib/utils";

export type LegendaItem = {
  label: string;
  warna: string;
  /** Bentuk penanda; kotak 12 px adalah bawaan. */
  bentuk?: "kotak" | "garis" | "titik";
};

/** Legenda grafik: kotak 12 px + teks abu 14 px. */
export function Legend({
  items,
  className,
  ariaLabel = "Legenda grafik",
}: {
  items: LegendaItem[];
  className?: string;
  ariaLabel?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul
      aria-label={ariaLabel}
      className={cn("mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-muted", className)}
    >
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn("size-3 shrink-0 rounded-[3px]", item.bentuk === "titik" && "rounded-full", item.bentuk === "garis" && "h-0.5 w-5 rounded-full")}
            style={{ backgroundColor: item.warna }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
