"use client";

import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { CommodityIcon } from "@/components/commodity-icon";
import { Sparkline } from "@/components/charts/sparkline";
import { ChangeChip, StatusChip } from "@/components/ui/status-chip";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { formatRupiah, formatTanggalPendek, statusHarga } from "@/lib/format";
import type { HargaStatus, HargaTerkini } from "@/lib/types";
import { cn } from "@/lib/utils";

type SortKey = "nama" | "harga" | "satu" | "tujuh" | "tiga_puluh";
type SortDir = "asc" | "desc";

const filterStatus: Array<HargaStatus | "Semua"> = ["Semua", "Naik", "Turun", "Stabil"];

/**
 * Status 30 hari memakai perubahan 30 hari yang dikirim API, dengan ambang
 * yang sama seperti aturan status API: naik bila ≥ +1%, turun bila ≤ −1%.
 */
function status30(item: HargaTerkini): HargaStatus {
  return statusHarga(item.perubahan.tiga_puluh_hari);
}

function SortLabel({
  kolom,
  label,
  sortKey,
  sortDir,
  onSort,
}: {
  kolom: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const aktif = sortKey === kolom;
  const Icon = aktif && sortDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onSort(kolom)}
      className="inline-flex min-h-11 items-center gap-1 rounded text-left text-sm font-medium text-ink-muted hover:text-primary-700"
    >
      {label}
      <Icon size={13} className={cn(!aktif && "opacity-30")} />
    </button>
  );
}

export function PriceTable({ data }: { data: HargaTerkini[] }) {
  const [cari, setCari] = useState("");
  const [status, setStatus] = useState<HargaStatus | "Semua">("Semua");
  const [sortKey, setSortKey] = useState<SortKey>("tujuh");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const hasil = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return data
      .filter((item) => (status === "Semua" ? true : status30(item) === status))
      .filter((item) => (kata ? item.nama.toLowerCase().includes(kata) : true))
      .sort((a, b) => {
        const nilai = (item: HargaTerkini) => {
          if (sortKey === "nama") return item.nama;
          if (sortKey === "harga") return item.harga_terkini ?? -Infinity;
          if (sortKey === "satu") return item.perubahan.satu_hari ?? -Infinity;
          if (sortKey === "tujuh") return item.perubahan.tujuh_hari ?? -Infinity;
          return item.perubahan.tiga_puluh_hari ?? -Infinity;
        };
        const kiri = nilai(a);
        const kanan = nilai(b);
        if (typeof kiri === "string" && typeof kanan === "string") {
          return sortDir === "asc"
            ? kiri.localeCompare(kanan, "id")
            : kanan.localeCompare(kiri, "id");
        }
        return sortDir === "asc"
          ? Number(kiri) - Number(kanan)
          : Number(kanan) - Number(kiri);
      });
  }, [cari, data, sortDir, sortKey, status]);

  function ubahSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((arah) => (arah === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "nama" ? "asc" : "desc");
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">Cari komoditas</span>
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            value={cari}
            onChange={(event) => setCari(event.target.value)}
            placeholder="Cari komoditas…"
            className="h-12 w-full rounded-ctl border border-line bg-surface pl-10 pr-3 text-base text-ink placeholder:text-ink-muted/70 focus:border-primary-500"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status harga">
          {filterStatus.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={status === item}
              onClick={() => setStatus(item)}
              className={cn(
                "min-h-11 rounded-full border px-3 text-sm font-medium transition-colors",
                status === item
                  ? "border-primary-600 bg-primary-50 text-primary-700"
                  : "border-line bg-surface text-ink-muted hover:border-primary-500",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {hasil.length === 0 ? (
        <div className="rounded-ctl border border-dashed border-line px-6 py-10 text-center text-ink-muted">
          Tidak ada komoditas yang cocok. Coba kata kunci atau filter lain.
        </div>
      ) : null}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[880px] border-collapse text-base">
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="px-2 py-2" aria-sort={sortKey === "nama" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                <SortLabel kolom="nama" label="Komoditas" sortKey={sortKey} sortDir={sortDir} onSort={ubahSort} />
              </th>
              <th scope="col" className="px-2 py-2" aria-sort={sortKey === "harga" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                <SortLabel kolom="harga" label="Harga terkini" sortKey={sortKey} sortDir={sortDir} onSort={ubahSort} />
              </th>
              <th scope="col" className="px-2 py-2" aria-sort={sortKey === "satu" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                <SortLabel kolom="satu" label="1 hari" sortKey={sortKey} sortDir={sortDir} onSort={ubahSort} />
              </th>
              <th scope="col" className="px-2 py-2" aria-sort={sortKey === "tujuh" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                <SortLabel kolom="tujuh" label="7 hari" sortKey={sortKey} sortDir={sortDir} onSort={ubahSort} />
              </th>
              <th scope="col" className="px-2 py-2" aria-sort={sortKey === "tiga_puluh" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                <SortLabel kolom="tiga_puluh" label="30 hari" sortKey={sortKey} sortDir={sortDir} onSort={ubahSort} />
              </th>
              <th scope="col" className="px-2 py-2">
                <InfoTooltip
                  label="Status 30 hari"
                  text="Naik bila perubahan lebih dari +1%, turun bila kurang dari −1%."
                  align="right"
                />
              </th>
              <th scope="col" className="px-2 py-2 text-sm font-medium text-ink-muted">30 hari terakhir</th>
            </tr>
          </thead>
          <tbody>
            {hasil.map((item) => (
              <tr key={item.komoditas_id} className="border-b border-line/80 hover:bg-primary-50/60">
                <td className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    <CommodityIcon nama={item.nama} />
                    <div>
                      <p className="font-semibold text-ink">{item.nama}</p>
                      <p className="text-sm text-ink-muted">Data {formatTanggalPendek(item.tanggal_terkini)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3 font-semibold text-ink">
                  {formatRupiah(item.harga_terkini, item.satuan)}
                </td>
                <td className="px-2 py-3">
                  <ChangeChip value={item.perubahan.satu_hari} />
                </td>
                <td className="px-2 py-3">
                  <ChangeChip value={item.perubahan.tujuh_hari} />
                </td>
                <td className="px-2 py-3">
                  <ChangeChip value={item.perubahan.tiga_puluh_hari} />
                </td>
                <td className="px-2 py-3">
                  <StatusChip status={status30(item)} />
                </td>
                <td className="px-2 py-3">
                  <Sparkline data={item.grafik_mini} label={`Grafik mini ${item.nama}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {hasil.map((item) => (
          <article key={item.komoditas_id} className="rounded-ctl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <CommodityIcon nama={item.nama} />
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{item.nama}</p>
                  <p className="text-sm text-ink-muted">Data {formatTanggalPendek(item.tanggal_terkini)}</p>
                </div>
              </div>
              <StatusChip status={status30(item)} />
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xl font-bold text-ink">{formatRupiah(item.harga_terkini, item.satuan)}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <ChangeChip value={item.perubahan.satu_hari} label="1 hari" />
                  <ChangeChip value={item.perubahan.tujuh_hari} label="7 hari" />
                  <ChangeChip value={item.perubahan.tiga_puluh_hari} label="30 hari" />
                </div>
              </div>
              <Sparkline data={item.grafik_mini} label={`Grafik mini ${item.nama}`} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
