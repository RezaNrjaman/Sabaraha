import Link from "next/link";
import { Activity, Info } from "lucide-react";

import { CommodityIcon } from "@/components/commodity-icon";
import { ChartFrame } from "@/components/charts/chart-frame";
import { ProgressBar } from "@/components/charts/range-bar";
import { TrendChart } from "@/components/charts/trend-chart";
import { TrendTable } from "@/components/charts/trend-table";
import { FilterChips, ResetFilter } from "@/components/filters/filter-chips";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { fetchApiData } from "@/lib/api";
import { findSpikes } from "@/lib/data";
import { ambilAngka, ambilDaftar } from "@/lib/filters";
import { formatAngka, formatPersen, formatRupiah, formatTanggal } from "@/lib/format";
import { buildQuery, hariSebelum } from "@/lib/query";
import type { HargaPoint, InfoData, Komoditas, Volatilitas } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Volatilitas",
};

export default async function VolatilitasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const info = await fetchApiData<InfoData>("/info");
  const semuaKomoditas = await fetchApiData<Komoditas[]>("/komoditas");
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

  return (
    <>
      <PageHeader
        eyebrow="Stabilitas harga"
        title="Volatilitas Harga"
        description="Komoditas dengan harga paling sering dan paling jauh berubah. Semakin tinggi koefisien variasi, semakin berisiko harga naik-turun."
        actions={<ResetFilter href="/volatilitas" />}
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
            <p className="mb-2 text-sm font-semibold text-ink">Rentang waktu</p>
            <FilterChips
              param="hari"
              label="Rentang waktu volatilitas"
              options={[30, 90, 365].map((item) => ({
                value: String(item),
                label: item === 365 ? "1 tahun" : `${item} hari`,
              }))}
              selected={[String(hari)]}
            />
          </div>
          <p className="text-sm text-ink-muted">
            {formatTanggal(dari)} – {formatTanggal(sampai)}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">Peringkat Volatilitas</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Koefisien variasi = simpangan baku sampel ÷ rata-rata × 100.
              </p>
            </div>
            <Activity className="shrink-0 text-primary-600" size={22} />
          </div>
          {volatilitas.length === 0 ? (
            <EmptyState title="Belum ada data volatilitas" actionHref="/volatilitas" />
          ) : (
            <ol className="space-y-4">
              {volatilitas.map((item, index) => (
                <li key={item.komoditas_id}>
                  <Link
                    href={`/volatilitas?komoditas=${encodeURIComponent(item.nama)}&hari=${hari}`}
                    className={cn(
                      "block rounded-ctl p-2 hover:bg-primary-50",
                      item.nama === namaAman && "bg-primary-50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="w-5 shrink-0 text-sm font-semibold text-ink-muted">
                          {index + 1}
                        </span>
                        <CommodityIcon nama={item.nama} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{item.nama}</p>
                          <p className="text-sm text-ink-muted">
                            {formatAngka(item.jumlah_titik, 0)} titik · rata-rata{" "}
                            {formatRupiah(item.rata_rata)}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-ink">
                        {formatPersen(item.koefisien_variasi_persen)}
                      </span>
                    </div>
                    <div className="mt-2 pl-[72px]">
                      <ProgressBar
                        value={item.koefisien_variasi_persen}
                        max={maksimal}
                        label={`Volatilitas ${item.nama} ${formatPersen(item.koefisien_variasi_persen)}`}
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-5 border-t border-line pt-3 text-sm leading-5 text-ink-muted">
            Simpangan baku sampel (n−1) dihitung dari harga yang tersedia. Komoditas dengan
            harga lebih tinggi tidak otomatis lebih volatil karena ukuran ini relatif terhadap
            rata-ratanya.
          </p>
        </Card>

        <div className="space-y-6 xl:col-span-5">
          <Card>
            <div className="flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <Activity size={20} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-ink">{namaAman}</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {peringkat
                    ? `Koefisien variasi ${formatPersen(peringkat.koefisien_variasi_persen)} · ${formatAngka(peringkat.jumlah_titik, 0)} titik`
                    : "Data periode ini belum tersedia."}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4">
              <div>
                <p className="text-sm text-ink-muted">Rata-rata harga</p>
                <p className="mt-1 font-semibold text-ink">
                  {peringkat ? formatRupiah(peringkat.rata_rata) : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-ink-muted">Simpangan baku</p>
                <p className="mt-1 font-semibold text-ink">
                  {peringkat ? formatRupiah(peringkat.simpangan_baku) : "-"}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-ctl border border-line bg-bg px-3 py-2 text-sm text-ink-muted">
              <Info size={16} className="mt-0.5 shrink-0" />
              <p>
                {lonjakan.length} lonjakan terdeteksi. Metode: harga di luar rata-rata ± 2
                simpangan baku pada periode ini.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <ChartFrame
        className="mt-6"
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
      </ChartFrame>

      <p className="mt-4 text-sm leading-5 text-ink-muted">
        Lonjakan adalah indikator statistik sederhana, bukan penyebab harga. Hari kerja dengan
        data kosong tidak dihitung sebagai harga nol.
      </p>
    </>
  );
}
