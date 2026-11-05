"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

import { CommodityIcon } from "@/components/commodity-icon";
import { HBarList, type BarisBilah } from "@/components/ui/hbar-list";
import { formatPersenBertanda } from "@/lib/format";
import type { Peringkat } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RankingList({
  naik,
  turun,
}: {
  naik: Peringkat[];
  turun: Peringkat[];
}) {
  const [tab, setTab] = useState<"naik" | "turun">("naik");
  const data = tab === "naik" ? naik : turun;
  const max = Math.max(1, ...data.map((item) => Math.abs(item.persen)));

  const items: BarisBilah[] = data.map((item) => ({
    label: item.nama,
    sublabel: `${formatPersenBertanda(item.persen)} dalam 30 hari`,
    ikon: <CommodityIcon nama={item.nama} />,
    teks: formatPersenBertanda(item.persen),
    lebar: (Math.abs(item.persen) / max) * 100,
    tone: tab === "naik" ? "naik" : "turun",
    href: `/?bagian=tren&komoditas=${encodeURIComponent(item.nama)}`,
  }));

  return (
    <div>
      <div
        className="mb-5 inline-flex rounded-ctl border border-line bg-bg p-1"
        role="tablist"
        aria-label="Peringkat perubahan harga"
      >
        {(["naik", "turun"] as const).map((item) => {
          const aktif = tab === item;
          const Icon = item === "naik" ? ArrowUp : ArrowDown;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={aktif}
              onClick={() => setTab(item)}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-[9px] px-3 text-sm font-medium transition-colors",
                aktif ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
              )}
            >
              <Icon size={16} aria-hidden="true" />
              Paling {item}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={`Komoditas paling ${tab}`}>
        {items.length === 0 ? (
          <p className="rounded-ctl border border-dashed border-line px-4 py-8 text-center text-ink-muted">
            Tidak ada komoditas yang {tab} pada 30 hari terakhir.
          </p>
        ) : (
          <HBarList items={items} ariaLabel={`Komoditas paling ${tab} dalam 30 hari`} />
        )}
      </div>
    </div>
  );
}
