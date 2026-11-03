import { CalendarDays } from "lucide-react";

import { ChartFrame } from "@/components/charts/chart-frame";
import { GroupedBarChart } from "@/components/charts/grouped-bar-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { TrendTable } from "@/components/charts/trend-table";
import { FilterChips, ResetFilter } from "@/components/filters/filter-chips";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { fetchApiData } from "@/lib/api";
import { bandsPeriode, monthlyAverageByYear, pivotHarga } from "@/lib/data";
import { ambilDaftar } from "@/lib/filters";
import {
  formatAngka,
  formatPersen,
  formatPersenBertanda,
  formatRupiah,
  formatTanggal,
} from "@/lib/format";
import { buildQuery, pilihanParam } from "@/lib/query";
import type { HargaPoint, InfoData, Komoditas, Periode, StatistikPeriode } from "@/lib/types";

export const metadata = {
  title: "Periode & Musiman",
};

const WARNA_TAHUN = ["#2B7A4B", "#C2410C", "#1F6FA8", "#7C3AED", "#A16207", "#0E7490"];
const URUTAN_PERIODE = ["Ramadan", "Idul Fitri", "Idul Adha", "Natal-Tahun Baru", "Musim Hujan"];

export default async function PeriodePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const info = await fetchApiData<InfoData>("/info");
  const semuaKomoditas = await fetchApiData<Komoditas[]>("/komoditas");
  const periode = await fetchApiData<Periode[]>("/periode");
  const statistik = await fetchApiData<StatistikPeriode[]>("/periode/statistik");
  const utama = semuaKomoditas.filter((item) => item.is_utama);
  const namaUtama = utama.map((item) => item.nama);
  const bawaan = namaUtama.includes("Cabai Merah") ? "Cabai Merah" : (namaUtama[0] ?? "Beras");
  const [namaDipilih] = ambilDaftar(sp.komoditas, [bawaan]);
  const namaAman = namaUtama.includes(namaDipilih) ? namaDipilih : bawaan;
  const periodeDipilih = pilihanParam(sp.periode, "");

  const rows = await fetchApiData<HargaPoint[]>(
    `/harga${buildQuery({
      komoditas: namaAman,
      dari: info.periode_data.dari,
      sampai: info.tanggal_data_terakhir,
      agregasi: "bulanan",
    })}`,
  );
  const statistikKomoditas = statistik
    .filter((item) => item.nama === namaAman)
    .filter((item) => (periodeDipilih ? item.periode_nama === periodeDipilih : true));
  const { data: dataTahunan, tahun } = monthlyAverageByYear(rows, namaAman);
  const seriHarga = [{ key: namaAman, label: namaAman, color: "#2B7A4B" }];
  const dataHarga = pivotHarga(rows.filter((row) => row.nama === namaAman));
  const pita = bandsPeriode(
    periode,
    info.periode_data.dari,
    info.tanggal_data_terakhir,
    dataHarga.map((point) => point.tanggal),
  );

  return (
    <>
      <PageHeader
        eyebrow="Pola musiman"
        title="Periode dan Musiman"
        description="Lihat bagaimana harga bergerak menjelang Ramadan, Lebaran, Idul Adha, Natal–Tahun Baru, dan musim hujan."
        actions={<ResetFilter href="/periode" />}
      />

      <Card className="mb-6">
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Komoditas</p>
            <FilterChips
              param="komoditas"
              label="Pilih komoditas"
              options={utama.map((item) => ({ value: item.nama, label: item.nama }))}
              selected={[namaAman]}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Filter tabel periode</p>
            <FilterChips
              param="periode"
              label="Filter periode"
              options={URUTAN_PERIODE.map((item) => ({ value: item, label: item }))}
              selected={periodeDipilih ? [periodeDipilih] : []}
              allowClear
            />
            <p className="mt-2 text-xs text-ink-muted">
              Klik periode yang sama untuk menampilkan semua periode.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <CalendarDays size={16} />
            {formatTanggal(info.periode_data.dari)} – {formatTanggal(info.tanggal_data_terakhir)} ·{" "}
            {pita.length} penanda periode
          </div>
        </div>
      </Card>

      <ChartFrame
        title={`Harga ${namaAman} dan Penanda Periode`}
        description="Harga bulanan. Pita menandai periode khusus; label muncul pada kemunculan pertama tiap periode."
        summary={`Grafik harga bulanan ${namaAman} dengan penanda periode khusus dari ${formatTanggal(info.periode_data.dari)} sampai ${formatTanggal(info.tanggal_data_terakhir)}.`}
        table={<TrendTable data={dataHarga} series={seriHarga} />}
        source="Sumber: Bank Indonesia – PIHPS Nasional"
      >
        <TrendChart
          data={dataHarga}
          series={seriHarga}
          periods={pita}
          showArea
          height={360}
          xFormat="bulan"
        />
      </ChartFrame>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-ink">Kenaikan Harga per Periode</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Pembanding: harga rata-rata 30 hari sebelum periode, minimal 15 titik.
            </p>
          </div>
          {statistikKomoditas.length === 0 ? (
            <EmptyState
              title="Statistik periode belum tersedia"
              description="Pilih komoditas atau periode lain."
              actionHref="/periode"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-ink-muted">
                    <th className="px-2 py-3 font-medium">Periode</th>
                    <th className="px-2 py-3 font-medium">Rata-rata</th>
                    <th className="px-2 py-3 font-medium">Median</th>
                    <th className="px-2 py-3 font-medium">Min</th>
                    <th className="px-2 py-3 font-medium">Maks</th>
                    <th className="px-2 py-3 font-medium">Kejadian</th>
                  </tr>
                </thead>
                <tbody>
                  {statistikKomoditas.map((item) => (
                    <tr key={`${item.periode_nama}`} className="border-b border-line/80">
                      <td className="px-2 py-3 font-semibold text-ink">{item.periode_nama}</td>
                      <td className="px-2 py-3">{formatPersenBertanda(item.rata_rata_persen)}</td>
                      <td className="px-2 py-3 font-semibold">{formatPersen(item.median_persen)}</td>
                      <td className="px-2 py-3 text-turun">{formatPersen(item.min_persen)}</td>
                      <td className="px-2 py-3 text-naik">{formatPersen(item.maks_persen)}</td>
                      <td className="px-2 py-3">{formatAngka(item.jumlah_kejadian, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 border-t border-line pt-3 text-xs leading-5 text-ink-muted">
            Hanya periode yang memiliki harga rata-rata 30 hari sebelumnya (minimal 15 titik)
            yang dihitung. Jumlah kejadian rendah membuat angka ini rentan variasi; gunakan
            sebagai pola umum, bukan kepastian.
          </p>
        </Card>

        <ChartFrame
          className="xl:col-span-5"
          title="Bulan yang Sama Antar Tahun"
          description={`Rata-rata harga ${namaAman} per bulan, dibandingkan antar tahun.`}
          summary={`Perbandingan harga bulanan ${namaAman} dari tahun ${tahun[0] ?? "-"} sampai ${tahun.at(-1) ?? "-"}.`}
          table={
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead className="sticky top-0 bg-bg text-left text-ink-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Bulan</th>
                  {tahun.map((item) => (
                    <th key={item} className="px-3 py-2 font-medium">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataTahunan.map((row) => (
                  <tr key={row.bulan} className="border-t border-line">
                    <td className="px-3 py-2">{row.bulan}</td>
                    {tahun.map((item) => (
                      <td key={item} className="px-3 py-2">
                        {row[item] === null || row[item] === undefined
                          ? "-"
                          : formatRupiah(Number(row[item]))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          }
        >
          <GroupedBarChart
            data={dataTahunan}
            xKey="bulan"
            bars={tahun.map((item, index) => ({
              key: item,
              label: item,
              color: WARNA_TAHUN[index] ?? "#2B7A4B",
            }))}
            height={300}
            yFormat="rupiah"
          />
        </ChartFrame>
      </div>

      <p className="mt-6 text-xs leading-5 text-ink-muted">
        Tanggal periode menggunakan kalender resmi yang tersedia di database. Periode mendatang
        bisa bertanda perkiraan. Data harga hanya hari kerja; bulan dengan data sedikit bisa
        membuat rata-rata bulanan kurang stabil.
      </p>
    </>
  );
}
