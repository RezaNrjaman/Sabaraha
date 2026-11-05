import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Bagian halaman: judul (h2) + satu baris catatan abu + isi.
 * Jarak antar bagian seragam 32 px (token spasi desain.md).
 */
export function Section({
  title,
  note,
  action,
  children,
  className,
}: {
  title: string;
  note?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-8 first:mt-0", className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-7 text-ink">{title}</h2>
          {note ? (
            <p className="mt-1 max-w-3xl text-sm leading-5 text-ink-muted">{note}</p>
          ) : null}
        </div>
        {action ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
