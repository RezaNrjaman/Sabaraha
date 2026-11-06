import { Activity, Info } from "lucide-react";

import { CommodityIcon } from "@/components/commodity-icon";
import { TrendChart } from "@/components/charts/trend-chart";
import { TrendTable } from "@/components/charts/trend-table";
import { FilterChips, ResetFilter } from "@/components/filters/filter-chips";
import { Card } from "@/components/ui/card";
import { ChartCard } from "@/components/ui/chart-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, FilterGroup } from "@/components/ui/filter-bar";
import { HBarList, type BarisBilah } from "@/components/ui/hbar-list";
import { Metric } from "@/components/ui/kpi-card";
import { PageFooter } from "@/components/ui/page-footer";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { fetchApiData } from "@/lib/api";
import { findSpikes } from "@/lib/data";
import { ambilAngka, ambilDaftar } from "@/lib/filters";
import { formatAngka, formatPersen, formatRupiah, formatTanggal } from "@/lib/format";
import { buildQuery, hariSebelum } from "@/lib/query";
import type { HargaPoint, InfoData, Komoditas, Volatilitas } from "@/lib/types";

export async function VolatilitasSection({
  sp,
}: {
  sp: Record<string, string | string[] | undefined>;
}) {
  const [info, semuaKomoditas] = await Promise.all([
    fetchApiData<InfoData>("/info"),
    fetchApiData<Komoditas[]>("/komoditas"),
  ]);
  const utama = semuaKomoditas.filter((item) => item.is_utama);
  const namaUtama = utama.map((item) => item.nama);
  const hari = [30, 90, 365].includes(ambilAngka(sp.hari, 365))
    ? ambilAngka(sp.hari, 365)
    : 365;
  const dari = hariSebelum(info.tanggal_data_terakhir, hari);
  const sampai = info.tanggal_data_terakhir;
  const volatilitas = await fetchApiData<Volatilitas[]>(
    `/volatilitas${buildQuery({ dari, sampai })}`,
  );
  const bawaan = volatilitas[0]?.nama ?? namaUtama[0] ?? "Beras";
  const [dipilih] = ambilDaftar(sp.komoditas, [bawaan]);
  const namaAman = namaUtama.includes(dipilih) ? dipilih : bawaan;
  const rows = await fetchApiData<HargaPoint[]>(
    `/harga${buildQuery({ komoditas: namaAman, dari, sampai, agregasi: "harian" })}`,
  );
  const titik = findSpikes(rows, namaAman);
  const lonjakan = titik.filter((point) => point.lonjakan);
  const maksimal = Math.max(1, ...volatilitas.map((item) => item.koefisien_variasi_persen));
  const peringkat = volatilitas.find((item) => item.nama === namaAman);
  const seri = [{ key: namaAman, label: namaAman, color: "#2B7A4B" }];
  const dataHarga = titik.map((point) => ({
    tanggal: point.tanggal,
    [namaAman]: point.harga,
  }));

  const items: BarisBilah[] = volatilitas.map((item, index) => ({
    label: item.nama,
    sublabel: `${index + 1}. ${formatAngka(item.jumlah_titik, 0)} titik · ${formatRupiah(item.rata_rata)}`,
    ikon: <CommodityIcon nama={item.nama} />,
    teks: formatPersen(item.koefisien_variasi_persen),
    lebar: (item.koefisien_variasi_persen / maksimal) * 100,
    tone: "primary",
    aktif: item.nama === namaAman,
    href: `/?bagian=volatilitas&komoditas=${encodeURIComponent(item.nama)}&hari=${hari}`,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Stabilitas harga"
        title="Volatilitas Harga"
        description="Komoditas dengan harga paling sering dan paling jauh berubah. Semakin tinggi koefisien variasi, semakin berisiko harga naik-turun."
      />

      <Section title="Saringan data" note="Pilih komoditas dan rentang waktu perhitungan volatilitas.">
        <FilterBar
          reset={<ResetFilter href="/?bagian=volatilitas" />}
          meta={
            <>
              <span>
                {formatTanggal(dari)} – {formatTanggal(sampai)}
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
          <FilterGroup label="Rentang waktu">
            <FilterChips
              param="hari"
              label="Rentang waktu volatilitas"
              options={[30, 90, 365].map((item) => ({
                value: String(item),
                label: item === 365 ? "1 tahun" : `${item} hari`,
              }))}
              selected={[String(hari)]}
            />
          </FilterGroup>
        </FilterBar>
      </Section>

      <Section
        title="Peringkat volatilitas"
        note="Koefisien variasi = simpangan baku sampel ÷ rata-rata × 100. Klik satu baris untuk melihat grafiknya."
      >
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-7">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-ink">Peringkat Volatilitas</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  Koefisien variasi = simpangan baku sampel ÷ rata-rata × 100.
                </p>
              </div>
              <Activity className="shrink-0 text-primary-600" size={22} aria-hidden="true" />
            </div>
            {volatilitas.length === 0 ? (
              <EmptyState title="Belum ada data volatilitas" actionHref="/?bagian=volatilitas" />
            ) : (
              <HBarList items={items} ariaLabel="Peringkat volatilitas komoditas" />
            )}
            <p className="mt-5 border-t border-line pt-3 text-sm leading-5 text-ink-muted">
              Simpangan baku sampel (n−1) dihitung dari harga yang tersedia. Komoditas dengan
              harga lebih tinggi tidak otomatis lebih volatil karena ukuran ini relatif terhadap
              rata-ratanya.
            </p>
          </Card>

          <Card className="flex flex-col xl:col-span-5">
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700"
              >
                <Activity size={20} />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-ink">{namaAman}</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {peringkat
                    ? `Koefisien variasi ${formatPersen(peringkat.koefisien_variasi_persen)} · ${formatAngka(peringkat.jumlah_titik, 0)} titik`
                    : "Data periode ini belum tersedia."}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4">
              <Metric
                label="Rata-rata harga"
                value={peringkat ? formatRupiah(peringkat.rata_rata) : "–"}
              />
              <Metric
                label="Simpangan baku"
                value={peringkat ? formatRupiah(peringkat.simpangan_baku) : "–"}
              />
            </div>
            <div className="mt-auto flex items-start gap-2 rounded-ctl border border-line bg-bg px-3 py-2 pt-3 text-sm text-ink-muted">
              <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>
                {lonjakan.length} lonjakan terdeteksi. Metode: harga di luar rata-rata ± 2
                simpangan baku pada periode ini.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      <Section
        title="Pergerakan harga"
        note="Titik merah menandai lonjakan di luar rata-rata ± 2 simpangan baku."
      >
        <ChartCard
          title={`Pergerakan Harga ${namaAman}`}
          description="Titik merah menandai lonjakan di luar dua simpangan baku."
          summary={`Grafik harga harian ${namaAman} dengan ${lonjakan.length} titik lonjakan pada periode ${formatTanggal(dari)} sampai ${formatTanggal(sampai)}.`}
          table={<TrendTable data={dataHarga} series={seri} />}
          source="Sumber: Bank Indonesia – PIHPS Nasional"
        >
          <TrendChart
            data={dataHarga}
            series={seri}
            spikes={lonjakan.map((point) => ({
              tanggal: point.tanggal,
              harga: point.harga,
              label: "Lonjakan",
            }))}
            height={320}
          />
        </ChartCard>
      </Section>

      <PageFooter note="Lonjakan adalah indikator statistik sederhana, bukan penyebab harga. Hari kerja dengan data kosong tidak dihitung sebagai harga nol." />
    </>
  );
}
