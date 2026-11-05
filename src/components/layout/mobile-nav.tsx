"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems, navAktif } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Menu bawah ponsel: kini hanya Dashboard dan Info Data, tanpa menu "Lainnya". */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"
      aria-label="Navigasi bawah"
    >
      <div className="mx-auto grid max-w-sm grid-cols-2 gap-1">
        {navItems.map((item) => {
          const aktif = navAktif(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={aktif ? "page" : undefined}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-ctl px-0.5 text-sm font-medium",
                aktif ? "bg-primary-600 text-white" : "text-ink-muted hover:bg-primary-50",
              )}
            >
              <Icon size={19} strokeWidth={1.8} />
              {item.shortLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
