import { CalendarDays } from "lucide-react";

import { LineGroupChart } from "@/components/charts/line-group-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { TrendTable } from "@/components/charts/trend-table";
import { FilterChips, ResetFilter } from "@/components/filters/filter-chips";
import { Card } from "@/components/ui/card";
import { ChartCard } from "@/components/ui/chart-card";
import { DataTable, type KolomDataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, FilterGroup } from "@/components/ui/filter-bar";
import { PageFooter } from "@/components/ui/page-footer";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { fetchApiData } from "@/lib/api";
import { bandsPeriode, monthlyAverageByYear, pivotHarga, type BulanTahunan } from "@/lib/data";
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

const WARNA_TAHUN = ["#2B7A4B", "#C2410C", "#1F6FA8", "#7C3AED", "#A16207", "#0E7490"];
const URUTAN_PERIODE = ["Ramadan", "Idul Fitri", "Idul Adha", "Natal-Tahun Baru", "Musim Hujan"];

export async function PeriodeSection({
  sp,
}: {
  sp: Record<string, string | string[] | undefined>;
}) {
  const [info, semuaKomoditas, periode, statistik] = await Promise.all([
    fetchApiData<InfoData>("/info"),
    fetchApiData<Komoditas[]>("/komoditas"),
    fetchApiData<Periode[]>("/periode"),
    fetchApiData<StatistikPeriode[]>("/periode/statistik"),
  ]);
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

  const kolomStatistik: KolomDataTable<StatistikPeriode>[] = [
    {
      key: "periode",
      header: "Periode",
      rata: "kiri",
      utama: true,
      isi: (item) => <span className="font-semibold text-ink">{item.periode_nama}</span>,
    },
    {
      key: "rata",
      header: "Rata-rata",
      isi: (item) => formatPersenBertanda(item.rata_rata_persen),
    },
    {
      key: "median",
      header: "Median",
      isi: (item) => <span className="font-semibold">{formatPersen(item.median_persen)}</span>,
    },
    {
      key: "min",
      header: "Min",
      isi: (item) => <span className="text-turun">{formatPersen(item.min_persen)}</span>,
    },
    {
      key: "maks",
      header: "Maks",
      isi: (item) => <span className="text-naik">{formatPersen(item.maks_persen)}</span>,
    },
    {
      key: "kejadian",
      header: "Kejadian",
      isi: (item) => formatAngka(item.jumlah_kejadian, 0),
    },
  ];

  const kolomTahun: KolomDataTable<BulanTahunan>[] = [
    {
      key: "bulan",
      header: "Bulan",
      rata: "kiri",
      utama: true,
      isi: (row) => <span className="font-medium text-ink">{row.bulan}</span>,
    },
    ...tahun.map((item) => ({
      key: item,
      header: item,
      isi: (row: BulanTahunan) =>
        row[item] === null || row[item] === undefined
          ? "–"
          : formatRupiah(Number(row[item])),
    })),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Pola musiman"
        title="Periode dan Musiman"
        description="Lihat bagaimana harga bergerak menjelang Ramadan, Lebaran, Idul Adha, Natal–Tahun Baru, dan musim hujan."
      />

      <Section
        title="Saringan data"
        note="Pilih komoditas, lalu saring tabel statistik per periode."
      >
        <FilterBar
          reset={<ResetFilter href="/?bagian=periode" />}
          meta={
            <>
              <CalendarDays size={16} aria-hidden="true" />
              <span>
                {formatTanggal(info.periode_data.dari)} –{" "}
                {formatTanggal(info.tanggal_data_terakhir)} · {pita.length} penanda periode
              </span>
            </>
          }
        >
          <FilterGroup label="Komoditas">
            <FilterChips
              param="komoditas"
              label="Pilih komoditas"
              options={utama.map((item) => ({ value: item.nama, label: item.nama }))}
              selected={[namaAman]}
            />
          </FilterGroup>
          <FilterGroup label="Periode" hint="Klik periode yang sama untuk menampilkan semua periode.">
            <FilterChips
              param="periode"
              label="Filter periode"
              options={URUTAN_PERIODE.map((item) => ({ value: item, label: item }))}
              selected={periodeDipilih ? [periodeDipilih] : []}
              allowClear
            />
          </FilterGroup>
        </FilterBar>
      </Section>

      <Section
        title="Penanda periode"
        note="Harga bulanan dengan pita latar tiap periode khusus. Label muncul pada kemunculan pertama tiap periode."
      >
        <ChartCard
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
        </ChartCard>
      </Section>

      <Section
        title="Kenaikan per periode"
        note="Pembanding: harga rata-rata 30 hari sebelum periode, minimal 15 titik."
      >
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-7">
            {statistikKomoditas.length === 0 ? (
              <EmptyState
                title="Statistik periode belum tersedia"
                description="Pilih komoditas atau periode lain."
                actionHref="/?bagian=periode"
              />
            ) : (
              <DataTable
                kolom={kolomStatistik}
                baris={statistikKomoditas}
                kunci={(item) => item.periode_nama}
                caption={`Kenaikan harga ${namaAman} per periode`}
                minLebar={560}
              />
            )}
            <p className="mt-4 border-t border-line pt-3 text-sm leading-5 text-ink-muted">
              Hanya periode yang memiliki harga rata-rata 30 hari sebelumnya (minimal 15 titik)
              yang dihitung. Jumlah kejadian rendah membuat angka ini rentan variasi; gunakan
              sebagai pola umum, bukan kepastian.
            </p>
          </Card>

          <ChartCard
            className="xl:col-span-5"
            title="Bulan yang Sama Antar Tahun"
            description={`Rata-rata harga ${namaAman} per bulan, dibandingkan antar tahun.`}
            summary={`Perbandingan harga bulanan ${namaAman} dari tahun ${tahun[0] ?? "-"} sampai ${tahun.at(-1) ?? "-"}.`}
            table={
              <DataTable
                kolom={kolomTahun}
                baris={dataTahunan}
                kunci={(row) => row.bulan}
                caption={`Rata-rata harga ${namaAman} per bulan dan tahun`}
                minLebar={480}
              />
            }
          >
            <LineGroupChart
              data={dataTahunan}
              xKey="bulan"
              garis={tahun.map((item, index) => ({
                key: item,
                label: item,
                color: WARNA_TAHUN[index] ?? "#2B7A4B",
              }))}
              height={300}
              yFormat="rupiah"
            />
          </ChartCard>
        </div>
      </Section>

      <PageFooter note="Tanggal periode menggunakan kalender resmi yang tersedia di database. Periode mendatang bisa bertanda perkiraan. Data harga hanya hari kerja; bulan dengan data sedikit bisa membuat rata-rata bulanan kurang stabil." />
    </>
  );
}
