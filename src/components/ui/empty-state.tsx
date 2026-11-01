import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

import { buttonClasses } from "@/components/ui/button";

export function EmptyState({
  title = "Belum ada data untuk pilihan ini",
  description = "Coba pilih komoditas atau rentang waktu lain.",
  action,
  actionLabel = "Atur ulang filter",
  actionHref,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center">
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
        <SearchX size={22} />
      </span>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-base text-ink-muted">{description}</p>
      {action ??
        (actionHref ? (
          <a href={actionHref} className={buttonClasses({ variant: "secondary", className: "mt-5" })}>
            {actionLabel}
          </a>
        ) : null)}
    </div>
  );
}
