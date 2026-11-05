"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wheat } from "lucide-react";

import { navItems, navAktif } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col border-r border-line bg-surface px-3 py-5 md:flex lg:w-[260px] lg:px-4">
      <Link
        href="/"
        className="mb-8 flex min-h-12 items-center gap-3 rounded-ctl px-1.5 lg:px-2"
        aria-label="Sabaraha, kembali ke dashboard"
      >
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-ctl bg-primary-600 text-white">
          <Wheat size={22} />
        </span>
        <span className="hidden min-w-0 lg:block">
          <span className="block text-xl font-bold leading-6 text-primary-700">Sabaraha</span>
          <span className="block text-sm text-ink-muted">Harga pangan Bandung</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Navigasi utama">
        {navItems.map((item) => {
          const aktif = navAktif(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-current={aktif ? "page" : undefined}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-ctl px-3 text-base font-medium transition-colors",
                aktif
                  ? "bg-primary-600 text-white"
                  : "text-ink-muted hover:bg-primary-50 hover:text-primary-700",
              )}
            >
              <Icon size={20} strokeWidth={1.75} className="shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
              <span className="sr-only lg:hidden">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 hidden border-t border-line pt-3 lg:block">
        <p className="px-3 text-sm leading-5 text-ink-muted">
          Data harga: Bank Indonesia – PIHPS Nasional.
        </p>
      </div>
    </aside>
  );
}
