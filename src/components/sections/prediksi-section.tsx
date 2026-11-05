import { CalendarClock, Info, Sparkles } from "lucide-react";

import { CommodityIcon } from "@/components/commodity-icon";
import { RangeBar } from "@/components/charts/range-bar";
import { FilterChips, ResetFilter } from "@/components/filters/filter-chips";
import { Card, CardHeader } from "@/components/ui/card";
import { Chip } from "@/components/ui/status-chip";
import { DataTable, type KolomDataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, FilterGroup } from "@/components/ui/filter-bar";
import { Metric } from "@/components/ui/kpi-card";
import { PageFooter } from "@/components/ui/page-footer";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { hitungBacktest, ringkasBacktest, type BarisBacktest } from "@/lib/backtest";
import { cobaAmbil, fetchApiData } from "@/lib/api";
import { ambilDaftar } from "@/lib/filters";
import {
  formatAngka,
  formatPersen,
  formatPersenBertanda,
  formatTanggal,
} from "@/lib/format";
import { buildQuery, pilihanParam } from "@/lib/query";
import type {
  HargaPoint,
  InfoData,
  Komoditas,
  Periode,
  PrediksiData,
  StatistikPeriode,
} from "@/lib/types";

const URUTAN_PERIODE = ["Ramadan", "Idul Fitri", "Idul Adha", "Natal-Tahun Baru", "Musim Hujan"];

/**
 * Uji mundur per kejadian. Harga harian dan tanggal kejadian diambil dari API,
 * lalu dihitung di bagian ini karena API tidak menyediakan endpoint backtest.
 */
async function ambilUjiMundur(namaKomoditas: string, namaPeriode: string) {
  const info = await fetchApiData<InfoData>("/info");
  const daftarPeriode = await fetchApiData<Periode[]>("/periode");
  const harga = await fetchApiData<HargaPoint[]>(
    `/harga${buildQuery({
      komoditas: namaKomoditas,
      dari: info.periode_data.dari,
      sampai: info.tanggal_data_terakhir,
      agregasi: "harian",
    })}`,
  );
  return hitungBacktest(harga, daftarPeriode, namaKomoditas, namaPeriode);
}

export async function PrediksiSection({
  sp,
}: {
  sp: Record<string, string | string[] | undefined>;
}) {
  const [semuaKomoditas, statistik] = await Promise.all([
    fetchApiData<Komoditas[]>("/komoditas"),
    fetchApiData<StatistikPeriode[]>("/periode/statistik"),
  ]);
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

  // Seluruh 10 komoditas selalu tampil. Baris tanpa statistik periode
  // diberi keterangan "Data belum cukup", bukan baris kosong.
  const tabel = namaUtama
    .map((nama) => ({
      nama,
      stat:
        statistik.find((item) => item.nama === nama && item.periode_nama === periodeTabel) ??
        null,
    }))
    .sort(
      (a, b) =>
        (b.stat?.median_persen ?? Number.NEGATIVE_INFINITY) -
        (a.stat?.median_persen ?? Number.NEGATIVE_INFINITY),
    );

  const ujiMundur = prediksi ? await ambilUjiMundur(namaAman, periodeTabel) : [];
  const ringkasUji = ringkasBacktest(ujiMundur);

  const kolomUji: KolomDataTable<BarisBacktest>[] = [
    {
      key: "tahun",
      header: "Tahun",
      rata: "kiri",
      utama: true,
      isi: (baris) => <span className="font-semibold text-ink">{baris.tahun}</span>,
    },
    {
      key: "prediksi",
      header: "Prediksi",
      isi: (baris) => (
        <>
          <span className="font-semibold text-ink">{formatPersenBertanda(baris.prediksi)}</span>
          <span className="block text-sm text-ink-muted">
            rentang {formatPersen(baris.rentangMin)} – {formatPersen(baris.rentangMaks)}
          </span>
        </>
      ),
      isiPonsel: (baris) => formatPersenBertanda(baris.prediksi),
    },
    {
      key: "aktual",
      header: "Kejadian sebenarnya",
      isi: (baris) => (
        <span className="font-semibold text-ink">{formatPersenBertanda(baris.aktual)}</span>
      ),
    },
    {
      key: "selisih",
      header: "Selisih",
      isi: (baris) => formatPersenBertanda(baris.selisih),
    },
  ];

  const kolomPrediksi: KolomDataTable<{ nama: string; stat: StatistikPeriode | null }>[] = [
    {
      key: "nama",
      header: "Komoditas",
      rata: "kiri",
      utama: true,
      isi: (row) => (
        <a
          href={`/?bagian=prediksi&komoditas=${encodeURIComponent(row.nama)}&periode=${encodeURIComponent(periodeTabel)}`}
          className="flex items-center gap-3 font-semibold text-ink hover:text-primary-700"
        >
          <CommodityIcon nama={row.nama} />
          <span className="min-w-0">
            {row.nama}
            {row.stat ? null : (
              <span className="block text-sm font-normal text-ink-muted">Data belum cukup</span>
            )}
          </span>
        </a>
      ),
      isiPonsel: (row) => (
        <span className="flex items-center gap-3 font-semibold text-ink">
          <CommodityIcon nama={row.nama} />
          <span className="min-w-0">
            {row.nama}
            {row.stat ? null : (
              <span className="block text-sm font-normal text-ink-muted">Data belum cukup</span>
            )}
          </span>
        </span>
      ),
    },
    {
      key: "median",
      header: "Median",
      isi: (row) =>
        row.stat ? <span className="font-semibold text-ink">{formatPersen(row.stat.median_persen)}</span> : "–",
    },
    {
      key: "rata",
      header: "Rata-rata",
      isi: (row) => (row.stat ? formatPersen(row.stat.rata_rata_persen) : "–"),
    },
    {
      key: "min",
      header: "Min",
      isi: (row) =>
        row.stat ? <span className="text-turun">{formatPersen(row.stat.min_persen)}</span> : "–",
    },
    {
      key: "maks",
      header: "Maks",
      isi: (row) =>
        row.stat ? <span className="text-naik">{formatPersen(row.stat.maks_persen)}</span> : "–",
    },
    {
      key: "kejadian",
      header: "Kejadian",
      isi: (row) => (row.stat ? formatAngka(row.stat.jumlah_kejadian, 0) : "–"),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Perkiraan berbasis pola historis"
        title="Prediksi Kenaikan Harga"
        description="Perkiraan persen kenaikan harga pada periode berikutnya. Nilai tengah adalah median kejadian historis, bukan jaminan."
      />

      <Section title="Saringan data" note="Pilih komoditas dan periode yang akan diperkirakan.">
        <FilterBar reset={<ResetFilter href="/?bagian=prediksi" />}>
          <FilterGroup label="Komoditas">
            <FilterChips
              param="komoditas"
              label="Pilih komoditas prediksi"
              options={utama.map((item) => ({ value: item.nama, label: item.nama }))}
              selected={[namaAman]}
            />
          </FilterGroup>
          <FilterGroup
            label="Periode"
            hint="Jika periode tidak dipilih, ditampilkan periode terdekat berikutnya."
          >
            <FilterChips
              param="periode"
              label="Pilih periode prediksi"
              options={URUTAN_PERIODE.map((item) => ({ value: item, label: item }))}
              selected={periodeAman ? [periodeAman] : []}
              allowClear
            />
          </FilterGroup>
        </FilterBar>
      </Section>

      {!prediksi ? (
        <Section
          title="Perkiraan periode berikutnya"
          note="Perkiraan median kenaikan harga pada periode terdekat."
        >
          <EmptyState
            title="Prediksi belum tersedia"
            description="Periode ini belum memiliki cukup kejadian historis. Coba periode lain."
            actionHref="/?bagian=prediksi"
          />
        </Section>
      ) : (
        <>
          <Section
            title="Perkiraan periode berikutnya"
            note="Median kejadian historis beserta rentang dan jumlah kejadiannya."
          >
            <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12">
              <Card className="flex flex-col xl:col-span-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink-muted">
                      Perkiraan harga saat {prediksi.periode_nama}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <CommodityIcon nama={prediksi.komoditas.nama} />
                      <h3 className="text-xl font-bold text-ink">{prediksi.komoditas.nama}</h3>
                    </div>
                  </div>
                  <Chip tone="seimbang" icon={<CalendarClock size={14} />}>
                    {formatTanggal(prediksi.tanggal_perkiraan)}
                  </Chip>
                </div>

                <p className="mt-6 text-[2rem] font-bold leading-10 tabular-nums text-ink">
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
                  <Metric label="Rata-rata" value={formatPersen(prediksi.rata_rata_persen)} />
                  <Metric
                    label="Rentang"
                    value={`${formatPersen(prediksi.min_persen)} – ${formatPersen(prediksi.maks_persen)}`}
                  />
                  <Metric
                    label="Kejadian"
                    value={`${formatAngka(prediksi.jumlah_kejadian, 0)} kali`}
                  />
                </div>

                <div className="mt-auto flex items-start gap-2 rounded-ctl border border-line bg-bg px-3 py-2 pt-3 text-sm text-ink-muted">
                  <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p>{prediksi.catatan}. Gunakan rentang, bukan hanya nilai tengah.</p>
                </div>
              </Card>

              <div className="space-y-4 sm:space-y-6 xl:col-span-5">
                <Card>
                  <CardHeader title="Cara Membaca" description="Metode prediksi" />
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700"
                    >
                      <Sparkles size={20} />
                    </span>
                    <p className="text-sm leading-6 text-ink-muted">{prediksi.metode}</p>
                  </div>
                  <div className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-sm text-ink-muted">
                    <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
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
                    <li>
                      • Pada uji mundur, prediksi satu kejadian dihitung dari kejadian lain agar
                      tidak ikut melatih dirinya sendiri.
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </Section>

          <Section
            title="Seberapa akurat?"
            note={`Perbandingan perkiraan dan kejadian nyata ${namaAman} pada periode ${periodeTabel}.`}
          >
            <Card>
              {!ringkasUji ? (
                <EmptyState
                  title="Kejadian belum cukup"
                  description="Uji mundur membutuhkan minimal dua kejadian periode dengan data harga yang lengkap."
                  actionHref="/?bagian=prediksi"
                />
              ) : (
                <>
                  <DataTable
                    kolom={kolomUji}
                    baris={ujiMundur}
                    kunci={(baris) => String(baris.tahun)}
                    caption={`Uji mundur prediksi ${namaAman} periode ${periodeTabel}`}
                    minLebar={560}
                  />
                  <p className="mt-4 border-t border-line pt-3 text-sm leading-6 text-ink">
                    Rata-rata meleset {formatAngka(ringkasUji.rataMeleset, 1)} poin persen; dari{" "}
                    {formatAngka(ringkasUji.jumlah, 0)} kejadian,{" "}
                    {formatAngka(ringkasUji.dalamRentang, 0)} jatuh dalam rentang.
                  </p>
                  <p className="mt-3 text-sm leading-5 text-ink-muted">
                    Dihitung dari harga harian dan tanggal kejadian: prediksi tiap kejadian memakai
                    median kejadian lain pada periode yang sama.
                  </p>
                </>
              )}
            </Card>
          </Section>

          <Section
            title="Perkiraan semua komoditas"
            note="Median dan rentang kenaikan per komoditas utama pada periode yang sama."
          >
            <Card>
              <CardHeader
                title={`Prediksi Semua Komoditas · ${periodeTabel || "Periode terpilih"}`}
                description="Klik satu komoditas untuk melihat grafiknya."
              />
              <DataTable
                kolom={kolomPrediksi}
                baris={tabel}
                kunci={(row) => row.nama}
                caption={`Prediksi semua komoditas periode ${periodeTabel}`}
                minLebar={720}
              />
              <p className="mt-4 border-t border-line pt-3 text-sm leading-5 text-ink-muted">
                Pembanding: harga rata-rata 30 hari sebelum periode, minimal 15 titik. Prediksi
                bukan jaminan dan tidak memperhitungkan kejadian luar biasa di masa depan.
              </p>
            </Card>
          </Section>
        </>
      )}

      <PageFooter note="Perkiraan dibuat dari pola harga historis Kota Bandung. Angka prediksi adalah median kejadian lampau, bukan jaminan masa depan." />
    </>
  );
}
