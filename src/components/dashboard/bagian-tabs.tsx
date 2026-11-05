"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { bagianItems, type KunciBagian } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Peralihan antar bagian dashboard. Berupa tautan biasa sehingga hanya satu
 * bagian yang dirender per permintaan, dan nama parameter filter tiap bagian
 * tidak pernah berebut satu URL yang sama.
 *
 * Pada layar sempit baris tab digulir mendatar, jadi tab terpilih selalu
 * digeser masuk pandangan agar posisi aktif tetap terlihat.
 */
export function BagianTabs({ aktif }: { aktif: KunciBagian }) {
  const daftarRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    daftarRef.current
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [aktif]);

  return (
    <nav aria-label="Bagian dashboard" className="mb-6 overflow-x-auto no-scrollbar">
      <ul ref={daftarRef} className="flex min-w-max items-center gap-2 pb-1">
        {bagianItems.map((item) => {
          const terpilih = item.kunci === aktif;
          const Icon = item.icon;
          return (
            <li key={item.kunci}>
              <Link
                href={item.href}
                aria-current={terpilih ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                  terpilih
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-line bg-surface text-ink-muted hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700",
                )}
              >
                <Icon size={16} strokeWidth={1.75} className="shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
