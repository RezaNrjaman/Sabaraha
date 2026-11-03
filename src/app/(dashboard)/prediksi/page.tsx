import Link from "next/link";
import { CalendarClock, Info, Sparkles } from "lucide-react";

import { CommodityIcon } from "@/components/commodity-icon";
import { RangeBar } from "@/components/charts/range-bar";
import { FilterChips, ResetFilter } from "@/components/filters/filter-chips";
import { Card, CardHeader } from "@/components/ui/card";
import { Chip } from "@/components/ui/status-chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { cobaAmbil, fetchApiData } from "@/lib/api";
import { ambilDaftar } from "@/lib/filters";
import {
  formatAngka,
  formatPersen,
  formatPersenBertanda,
  formatTanggal,
} from "@/lib/format";
import { buildQuery, pilihanParam } from "@/lib/query";
import type { Komoditas, PrediksiData, StatistikPeriode } from "@/lib/types";

export const metadata = {
  title: "Prediksi",
};

const URUTAN_PERIODE = ["Ramadan", "Idul Fitri", "Idul Adha", "Natal-Tahun Baru", "Musim Hujan"];

export default async function PrediksiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const semuaKomoditas = await fetchApiData<Komoditas[]>("/komoditas");
  const statistik = await fetchApiData<StatistikPeriode[]>("/periode/statistik");
  const utama = semuaKomoditas.filter((item) => item.is_utama);
  const namaUtama = utama.map((item) => item.nama);
  const bawaan = namaUtama.includes("Cabai Merah") ? "Cabai Merah" : (namaUtama[0] ?? "Beras");
  const [dipilih] = ambilDaftar(sp.komoditas, [bawaan]);
  const namaAman = namaUtama.includes(dipilih) ? dipilih : bawaan;
  const periodeDipilih = pilihanParam(sp.periode, "");
  const periodeAman = URUTAN_PERIODE.includes(periodeDipilih) ? periodeDipilih : "";
  const prediksi = await cobaAmbil<PrediksiData>(
    `/prediksi${buildQuery({ komoditas: namaAman, periode: periodeAman || undefined })}`,
  );
  const periodeTabel = prediksi?.periode_nama ?? periodeAman;
  const tabel = statistik
    .filter((item) => item.periode_nama === periodeTabel)
    .sort((a, b) => b.median_persen - a.median_persen);

  return (
    <>
      <PageHeader
        eyebrow="Perkiraan berbasis pola historis"
        title="Prediksi Kenaikan Harga"
        description="Perkiraan persen kenaikan harga pada periode berikutnya. Nilai tengah adalah median kejadian historis, bukan jaminan."
        actions={<ResetFilter href="/prediksi" />}
      />

      <Card className="mb-6">
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Komoditas</p>
            <FilterChips
              param="komoditas"
              label="Pilih komoditas prediksi"
              options={utama.map((item) => ({ value: item.nama, label: item.nama }))}
              selected={[namaAman]}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Periode</p>
            <FilterChips
              param="periode"
              label="Pilih periode prediksi"
              options={URUTAN_PERIODE.map((item) => ({ value: item, label: item }))}
              selected={periodeAman ? [periodeAman] : []}
              allowClear
            />
            <p className="mt-2 text-xs text-ink-muted">
              Tanpa pilihan periode, API memakai periode terdekat setelah tanggal data terakhir.
            </p>
          </div>
        </div>
      </Card>

      {!prediksi ? (
        <EmptyState
          title="Prediksi belum tersedia"
          description="Periode ini belum memiliki cukup kejadian historis. Coba periode lain."
          actionHref="/prediksi"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <Card className="xl:col-span-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink-muted">
                    Perkiraan harga saat {prediksi.periode_nama}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <CommodityIcon nama={prediksi.komoditas.nama} />
                    <h2 className="text-xl font-bold text-ink">{prediksi.komoditas.nama}</h2>
                  </div>
                </div>
                <Chip tone="seimbang" icon={<CalendarClock size={14} />}>
                  {formatTanggal(prediksi.tanggal_perkiraan)}
                </Chip>
              </div>

              <p className="mt-6 text-[2rem] font-bold leading-10 text-ink">
                {formatPersenBertanda(prediksi.median_persen)}
              </p>
              <p className="text-sm text-ink-muted">
                Nilai tengah (median) dari {prediksi.jumlah_kejadian} kejadian historis
              </p>

              <div className="mt-6">
                <RangeBar
                  min={prediksi.min_persen}
                  median={prediksi.median_persen}
                  max={prediksi.maks_persen}
                />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-line pt-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-ink-muted">Rata-rata</p>
                  <p className="mt-1 font-semibold text-ink">
                    {formatPersen(prediksi.rata_rata_persen)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-ink-muted">Rentang</p>
                  <p className="mt-1 font-semibold text-ink">
                    {formatPersen(prediksi.min_persen)} – {formatPersen(prediksi.maks_persen)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-ink-muted">Kejadian</p>
                  <p className="mt-1 font-semibold text-ink">
                    {formatAngka(prediksi.jumlah_kejadian, 0)} kali
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-2 rounded-ctl border border-line bg-bg px-3 py-2 text-sm text-ink-muted">
                <Info size={16} className="mt-0.5 shrink-0" />
                <p>{prediksi.catatan}. Gunakan rentang, bukan hanya nilai tengah.</p>
              </div>
            </Card>

            <div className="space-y-6 xl:col-span-5">
              <Card>
                <CardHeader title="Cara Membaca" description="Metode prediksi" />
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <Sparkles size={20} />
                  </span>
                  <p className="text-sm leading-6 text-ink-muted">{prediksi.metode}</p>
                </div>
                <div className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-sm text-ink-muted">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <p>
                    Jumlah kejadian per periode hanya sekitar 5–6. Semakin sedikit kejadian,
                    semakin lebar ketidakpastiannya.
                  </p>
                </div>
              </Card>
              <Card>
                <CardHeader title="Keterbatasan" />
                <ul className="space-y-2 text-sm leading-6 text-ink-muted">
                  <li>• Prediksi memakai pola historis, bukan model machine learning kompleks.</li>
                  <li>• Tanggal periode Hijriah bergeser setiap tahun.</li>
                  <li>• Kejadian luar biasa dapat membuat rentang sangat lebar.</li>
                  <li>• Backtest per kejadian belum tersedia di API versi ini; angka tidak dibuat.</li>
                </ul>
              </Card>
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader
              title={`Prediksi Semua Komoditas · ${periodeTabel || "Periode terpilih"}`}
              description="Median dan rentang kenaikan per komoditas utama pada periode yang sama."
            />
            {tabel.length === 0 ? (
              <EmptyState
                title="Belum ada statistik untuk periode ini"
                description="Coba pilih periode lain."
                actionHref="/prediksi"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-ink-muted">
                      <th className="px-2 py-3 font-medium">Komoditas</th>
                      <th className="px-2 py-3 font-medium">Median</th>
                      <th className="px-2 py-3 font-medium">Rata-rata</th>
                      <th className="px-2 py-3 font-medium">Min</th>
                      <th className="px-2 py-3 font-medium">Maks</th>
                      <th className="px-2 py-3 font-medium">Kejadian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabel.map((item) => (
                      <tr key={item.komoditas_id} className="border-b border-line/80 hover:bg-primary-50/60">
                        <td className="px-2 py-3">
                          <Link
                            href={`/prediksi?komoditas=${encodeURIComponent(item.nama)}&periode=${encodeURIComponent(periodeTabel)}`}
                            className="flex items-center gap-3 font-semibold text-ink hover:text-primary-700"
                          >
                            <CommodityIcon nama={item.nama} />
                            {item.nama}
                          </Link>
                        </td>
                        <td className="px-2 py-3 font-semibold text-ink">
                          {formatPersen(item.median_persen)}
                        </td>
                        <td className="px-2 py-3">{formatPersen(item.rata_rata_persen)}</td>
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
              Baseline: rata-rata 30 hari kalender sebelum periode, minimal 15 titik. Prediksi
              bukan jaminan dan tidak memperhitungkan kejadian luar biasa di masa depan.
            </p>
          </Card>
        </>
      )}
    </>
  );
}
