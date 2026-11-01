"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { navItems, navAktif } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [terbuka, setTerbuka] = useState(false);
  const utama = navItems.slice(0, 4);
  const lainnya = navItems.slice(4);

  useEffect(() => {
    if (!terbuka) return;
    const tutup = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTerbuka(false);
    };
    window.addEventListener("keydown", tutup);
    return () => window.removeEventListener("keydown", tutup);
  }, [terbuka]);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"
        aria-label="Navigasi bawah"
      >
        <div className="grid grid-cols-5 gap-1">
          {utama.map((item) => {
            const aktif = navAktif(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-ctl px-1 text-[11px] font-medium",
                  aktif ? "bg-primary-600 text-white" : "text-ink-muted hover:bg-primary-50",
                )}
              >
                <Icon size={19} strokeWidth={1.8} />
                {item.shortLabel}
              </Link>
            );
          })}
          <button
            type="button"
            aria-expanded={terbuka}
            aria-controls="menu-lainnya"
            onClick={() => setTerbuka((nilai) => !nilai)}
            className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-ctl px-1 text-[11px] font-medium text-ink-muted hover:bg-primary-50"
          >
            {terbuka ? <X size={19} /> : <Menu size={19} />}
            Lainnya
          </button>
        </div>
      </nav>

      {terbuka ? (
        <div className="fixed inset-0 z-50 md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-ink/30"
            aria-label="Tutup menu"
            onClick={() => setTerbuka(false)}
          />
          <div
            id="menu-lainnya"
            role="dialog"
            aria-modal="true"
            aria-label="Menu lainnya"
            className="absolute inset-x-3 bottom-24 rounded-card border border-line bg-surface p-3 shadow-card"
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-sm font-semibold text-ink">Menu lainnya</p>
              <button
                type="button"
                onClick={() => setTerbuka(false)}
                className="inline-flex size-10 items-center justify-center rounded-full text-ink-muted hover:bg-primary-50"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1">
              {lainnya.map((item) => {
                const aktif = navAktif(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setTerbuka(false)}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-ctl px-3 text-base font-medium",
                      aktif ? "bg-primary-600 text-white" : "text-ink-muted hover:bg-primary-50",
                    )}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
