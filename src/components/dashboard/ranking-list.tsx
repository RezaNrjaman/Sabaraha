"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

import { CommodityIcon } from "@/components/commodity-icon";
import { ProgressBar } from "@/components/charts/range-bar";
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

  return (
    <div>
      <div className="mb-4 inline-flex rounded-ctl border border-line bg-bg p-1" role="tablist" aria-label="Peringkat perubahan harga">
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
              <Icon size={14} />
              Paling {item}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={`Komoditas paling ${tab}`}>
        {data.length === 0 ? (
          <p className="rounded-ctl border border-dashed border-line px-4 py-8 text-center text-ink-muted">
            Tidak ada komoditas yang {tab} pada 30 hari terakhir.
          </p>
        ) : (
          <ol className="space-y-4">
            {data.map((item) => {
              const tone = tab === "naik" ? "naik" : "turun";
              return (
                <li key={item.komoditas_id}>
                  <Link
                    href={`/tren?komoditas=${encodeURIComponent(item.nama)}`}
                    className="group block rounded-ctl p-1 hover:bg-primary-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <CommodityIcon nama={item.nama} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink group-hover:text-primary-700">
                            {item.nama}
                          </p>
                          <p className="text-sm text-ink-muted">
                            {formatPersenBertanda(item.persen)} dalam 30 hari
                          </p>
                        </div>
                      </div>
                      <span className={cn("shrink-0 text-sm font-bold", tone === "naik" ? "text-naik" : "text-turun")}>
                        {formatPersenBertanda(item.persen)}
                      </span>
                    </div>
                    <div className="mt-2 pl-[52px]">
                      <ProgressBar
                        value={item.persen}
                        max={max}
                        tone={tone}
                        label={`Perubahan ${item.nama} ${formatPersenBertanda(item.persen)}`}
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
