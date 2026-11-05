import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

/** Kaki halaman: catatan abu dengan garis pemisah + tautan sumber dan metode. */
export function PageFooter({ note, action }: { note: ReactNode; action?: ReactNode }) {
  return (
    <footer className="mt-8 border-t border-line pt-4 text-sm leading-5 text-ink-muted">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-3xl">{note}</p>
        {action ?? (
          <a
            href="/info"
            className="inline-flex min-h-11 shrink-0 items-center gap-1 font-medium text-primary-700 hover:underline"
          >
            Sumber dan metode <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        )}
      </div>
    </footer>
  );
}
