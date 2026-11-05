import { ArrowUpRight, CalendarRange } from "lucide-react";

import { TrendChart } from "@/components/charts/trend-chart";
import { TrendTable } from "@/components/charts/trend-table";
import { FilterChips, ResetFilter } from "@/components/filters/filter-chips";
import { ChartCard } from "@/components/ui/chart-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, FilterGroup } from "@/components/ui/filter-bar";
import { Metric } from "@/components/ui/kpi-card";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { fetchApiData } from "@/lib/api";
import { bandsPeriode, buildAverageIndex, buildIndexComparison, pivotHarga, ringkasAngka } from "@/lib/data";
import { ambilAngka, ambilDaftar } from "@/lib/filters";
import { formatPersenBertanda, formatRupiah, formatTanggal } from "@/lib/format";
import { buildQuery, hariSebelum, pilihanParam } from "@/lib/query";
import type { Agregasi, HargaPoint, InfoData, Komoditas, Periode } from "@/lib/types";

const WARNA_SERI = ["#2B7A4B", "#C2410C", "#1F6FA8", "#7C3AED", "#A16207"];
const OPSI_HARI = [30, 90, 365] as const;
const OPSI_AGREGASI: Array<{ value: Agregasi; label: string }> = [
  { value: "harian", label: "Harian" },
  { value: "mingguan", label: "Mingguan" },
  { value: "bulanan", label: "Bulanan" },
];

export async function TrenSection({
  sp,
}: {
  sp: Record<string, string | string[] | undefined>;
}) {
  const info = await fetchApiData<InfoData>("/info");
  const semuaKomoditas = await fetchApiData<Komoditas[]>("/komoditas");
  const periode = await fetchApiData<Periode[]>("/periode");
  const utama = semuaKomoditas.filter((item) => item.is_utama);
  const namaUtama = utama.map((item) => item.nama);
  const bawaan = namaUtama.includes("Cabai Merah") ? "Cabai Merah" : (namaUtama[0] ?? "Beras");
  const dipilih = ambilDaftar(sp.komoditas, [bawaan])
    .filter((nama) => namaUtama.includes(nama))
    .slice(0, 5);
  const namaDipilih = dipilih.length > 0 ? dipilih : [bawaan];
  const hari = OPSI_HARI.includes(ambilAngka(sp.hari, 365) as 30 | 90 | 365)
    ? ambilAngka(sp.hari, 365)
    : 365;
  const agregasi = pilihanParam(sp.agregasi, "bulanan");
  const agregasiAman: Agregasi = ["harian", "mingguan", "bulanan"].includes(agregasi)
    ? (agregasi as Agregasi)
    : "bulanan";
  const dari = hariSebelum(info.tanggal_data_terakhir, hari);
  const sampai = info.tanggal_data_terakhir;

  const semuaRows = await fetchApiData<HargaPoint[]>(
    `/harga${buildQuery({
      dari,
      sampai,
      agregasi: agregasiAman,
    })}`,
  );
  const rows = semuaRows.filter((row) => namaDipilih.includes(row.nama));

  if (rows.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Tren harga"
          title="Belum ada data pada rentang ini"
          description="Coba perluas rentang waktu atau pilih komoditas lain."
        />
        <EmptyState actionHref="/?bagian=tren" />
      </>
    );
  }

  const satuKomoditas = namaDipilih.length === 1;
  const seri = satuKomoditas
    ? [{ key: namaDipilih[0], label: namaDipilih[0], color: WARNA_SERI[0] }]
    : namaDipilih.map((nama, index) => ({
        key: nama,
        label: nama,
        color: WARNA_SERI[index] ?? "#2B7A4B",
        dashed: index > 0,
      }));
  const dataGrafik = satuKomoditas ? pivotHarga(rows) : buildIndexComparison(rows);
  const dataIndeks = buildAverageIndex(rows);
  const nilaiRingkas = satuKomoditas
    ? rows.filter((row) => row.nama === namaDipilih[0]).map((row) => row.harga)
    : dataIndeks.map((point) => point.indeks);
  const ringkas = ringkasAngka(nilaiRingkas);
  const titikTertinggi = satuKomoditas
    ? rows
        .filter((row) => row.nama === namaDipilih[0])
        .reduce<HargaPoint | null>(
          (tertinggi, row) => (row.harga > (tertinggi?.harga ?? -Infinity) ? row : tertinggi),
          null,
        )
    : dataIndeks.reduce(
        (tertinggi, point) => (point.indeks > (tertinggi?.indeks ?? -Infinity) ? point : tertinggi),
        dataIndeks[0],
      );
  const perubahan =
    nilaiRingkas.length > 1
      ? ((nilaiRingkas[nilaiRingkas.length - 1] - nilaiRingkas[0]) / nilaiRingkas[0]) * 100
      : 0;
  const pita = bandsPeriode(
    periode,
    dari,
    sampai,
    dataGrafik.map((point) => point.tanggal),
  );

  return (
    <>
      <PageHeader
        eyebrow="Tren harga"
        title={satuKomoditas ? `Tren Harga ${namaDipilih[0]}` : "Perbandingan Harga Komoditas"}
        description={
          satuKomoditas
            ? `Harga ${agregasiAman} dari ${formatTanggal(dari)} sampai ${formatTanggal(sampai)}. Hari tanpa data tidak diisi nol.`
            : "Perbandingan memakai indeks: harga awal tiap komoditas dianggap 100, sehingga harga berbeda tetap bisa dibandingkan."
        }
      />

      <Section
        title="Saringan data"
        note="Atur komoditas, rentang waktu, dan cara data dirangkum. Pilihan berlaku langsung pada grafik."
      >
        <FilterBar
          reset={<ResetFilter href="/?bagian=tren" />}
          meta={
            <>
              <CalendarRange size={16} aria-hidden="true" />
              <span>
                {formatTanggal(dari)} – {formatTanggal(sampai)} · {rows.length} titik data
              </span>
            </>
          }
        >
          <FilterGroup label="Komoditas">
            <FilterChips
              param="komoditas"
              label="Pilih komoditas, maksimal 5"
              options={utama.map((item) => ({ value: item.nama, label: item.nama }))}
              selected={namaDipilih}
              multi
              max={5}
            />
            <p className="mt-2 text-sm text-ink-muted">
              Pilih 2–5 komoditas untuk membandingkan. Grafik otomatis memakai indeks.
            </p>
          </FilterGroup>
          <FilterGroup label="Rentang waktu">
            <FilterChips
              param="hari"
              label="Rentang waktu"
              options={OPSI_HARI.map((item) => ({
                value: String(item),
                label: item === 365 ? "1 tahun" : `${item} hari`,
              }))}
              selected={[String(hari)]}
            />
          </FilterGroup>
          <FilterGroup label="Agregasi">
            <FilterChips
              param="agregasi"
              label="Agregasi data"
              options={OPSI_AGREGASI}
              selected={[agregasiAman]}
            />
          </FilterGroup>
        </FilterBar>
      </Section>

      <Section
        title="Pergerakan harga"
        note={
          satuKomoditas
            ? `Nilai ${agregasiAman}, Kota Bandung. Garis putus-putus menandai rata-rata periode.`
            : "Semua seri dimulai dari 100 pada titik awal yang tersedia."
        }
      >
        <ChartCard
          title={satuKomoditas ? `Pergerakan Harga ${namaDipilih[0]}` : "Indeks Perbandingan Harga"}
          description={
            satuKomoditas
              ? `Nilai ${agregasiAman}, Kota Bandung`
              : "Semua seri dimulai dari 100 pada titik awal yang tersedia."
          }
          summary={
            satuKomoditas
              ? `Grafik harga ${namaDipilih[0]} dari ${formatTanggal(dari)} sampai ${formatTanggal(sampai)}.`
              : `Grafik indeks perbandingan ${namaDipilih.join(", ")}.`
          }
          table={
            <TrendTable
              data={dataGrafik}
              series={seri}
              mode={satuKomoditas ? "harga" : "indeks"}
            />
          }
          footer={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Metric
                label="Rata-rata"
                value={
                  satuKomoditas
                    ? formatRupiah(ringkas.rataRata)
                    : Number(ringkas.rataRata ?? 0).toFixed(1)
                }
                hint={satuKomoditas ? undefined : "Indeks"}
              />
              <Metric
                label="Tertinggi"
                value={
                  satuKomoditas
                    ? formatRupiah(ringkas.tertinggi)
                    : Number(ringkas.tertinggi ?? 0).toFixed(1)
                }
                hint={titikTertinggi ? formatTanggal(titikTertinggi.tanggal) : undefined}
              />
              <Metric
                label="Perubahan periode"
                value={formatPersenBertanda(perubahan)}
                hint={satuKomoditas ? "Harga awal ke akhir" : "Indeks awal ke akhir"}
              />
            </div>
          }
          source="Sumber: Bank Indonesia – PIHPS Nasional"
        >
          <TrendChart
            data={dataGrafik}
            series={seri}
            periods={pita}
            mode={satuKomoditas ? "harga" : "indeks"}
            showArea={satuKomoditas}
            height={340}
          />
        </ChartCard>
      </Section>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm leading-5 text-ink-muted">
        <p>
          Hari libur dan akhir pekan tidak memiliki data. Garis tidak disambung melewati nilai
          kosong.
        </p>
        <a
          href="/info"
          className="inline-flex min-h-11 items-center gap-1 font-medium text-primary-700 hover:underline"
        >
          Sumber dan metode <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </footer>
    </>
  );
}
