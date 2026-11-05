"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { CommodityIcon } from "@/components/commodity-icon";
import { SparklineMini } from "@/components/charts/sparkline";
import { DataTable, type KolomDataTable } from "@/components/ui/data-table";
import { FilterGroup } from "@/components/ui/filter-bar";
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

  const urut = (key: SortKey) => ({
    aktif: sortKey === key,
    arah: sortKey === key ? sortDir : ("desc" as const),
    onUbah: () => ubahSort(key),
  });

  const kolom: KolomDataTable<HargaTerkini>[] = [
    {
      key: "nama",
      header: "Komoditas",
      rata: "kiri",
      utama: true,
      urut: urut("nama"),
      isi: (item) => (
        <div className="flex items-center gap-3">
          <CommodityIcon nama={item.nama} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{item.nama}</p>
            <p className="truncate text-sm text-ink-muted">
              Data {formatTanggalPendek(item.tanggal_terkini)}
            </p>
          </div>
        </div>
      ),
      isiPonsel: (item) => (
        <div className="flex items-center gap-3">
          <CommodityIcon nama={item.nama} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{item.nama}</p>
            <p className="truncate text-sm text-ink-muted">
              Data {formatTanggalPendek(item.tanggal_terkini)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "harga",
      header: "Harga terkini",
      urut: urut("harga"),
      isi: (item) => (
        <span className="font-semibold text-ink">
          {formatRupiah(item.harga_terkini, item.satuan)}
        </span>
      ),
    },
    {
      key: "satu",
      header: "1 hari",
      urut: urut("satu"),
      isi: (item) => <ChangeChip value={item.perubahan.satu_hari} />,
    },
    {
      key: "tujuh",
      header: "7 hari",
      urut: urut("tujuh"),
      isi: (item) => <ChangeChip value={item.perubahan.tujuh_hari} />,
    },
    {
      key: "tiga_puluh",
      header: "30 hari",
      urut: urut("tiga_puluh"),
      isi: (item) => <ChangeChip value={item.perubahan.tiga_puluh_hari} />,
    },
    {
      key: "status",
      header: "Status 30 hari",
      rata: "kiri",
      isi: (item) => <StatusChip status={status30(item)} />,
      isiPonsel: (item) => <StatusChip status={status30(item)} />,
    },
    {
      key: "grafik",
      header: "30 hari terakhir",
      className: "hidden xl:table-cell",
      isi: (item) => (
        <div className="flex justify-end">
          <SparklineMini data={item.grafik_mini} label={`Grafik mini ${item.nama}`} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start gap-x-6 gap-y-4">
        <FilterGroup label="Cari komoditas" className="lg:max-w-xs">
          <label className="relative block">
            <span className="sr-only">Cari komoditas</span>
            <Search
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              value={cari}
              onChange={(event) => setCari(event.target.value)}
              placeholder="Ketik nama komoditas…"
              className="h-12 w-full rounded-ctl border border-line bg-surface pl-10 pr-3 text-base text-ink placeholder:text-ink-muted/70 focus:border-primary-500"
            />
          </label>
        </FilterGroup>

        <FilterGroup label="Status 30 hari">
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
        </FilterGroup>

        <div className="ml-auto shrink-0 pt-7">
          <InfoTooltip
            label="Status 30 hari"
            text="Naik bila perubahan lebih dari +1%, turun bila kurang dari −1%."
            align="right"
          />
        </div>
      </div>

      <DataTable
        kolom={kolom}
        baris={hasil}
        kunci={(item) => String(item.komoditas_id)}
        caption="Harga komoditas terkini dan perubahannya"
        minLebar={720}
        kosong={
          <div className="rounded-ctl border border-dashed border-line px-6 py-10 text-center text-ink-muted">
            Tidak ada komoditas yang cocok. Coba kata kunci atau filter lain.
          </div>
        }
        kartuPonsel={(item) => (
          <article>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <CommodityIcon nama={item.nama} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{item.nama}</p>
                  <p className="truncate text-sm text-ink-muted">
                    Data {formatTanggalPendek(item.tanggal_terkini)}
                  </p>
                </div>
              </div>
              <StatusChip status={status30(item)} />
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xl font-bold tabular-nums text-ink">
                  {formatRupiah(item.harga_terkini, item.satuan)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <ChangeChip value={item.perubahan.satu_hari} label="1 hari" />
                  <ChangeChip value={item.perubahan.tujuh_hari} label="7 hari" />
                  <ChangeChip value={item.perubahan.tiga_puluh_hari} label="30 hari" />
                </div>
              </div>
              <SparklineMini data={item.grafik_mini} label={`Grafik mini ${item.nama}`} />
            </div>
          </article>
        )}
      />
    </div>
  );
}
