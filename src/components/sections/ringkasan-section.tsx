import Link from "next/link";
import {
  ArrowUpRight,
  Gauge,
  PackageX,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { ChartCard } from "@/components/ui/chart-card";
import { DonutChart } from "@/components/charts/donut-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { TrendTable } from "@/components/charts/trend-table";
import { KpiCard, Metric } from "@/components/ui/kpi-card";
import { PriceTable } from "@/components/dashboard/price-table";
import { RankingList } from "@/components/dashboard/ranking-list";
import { Section } from "@/components/ui/section";
import { Sparkline } from "@/components/ui/sparkline";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import { buildAverageIndex, ringkasAngka } from "@/lib/data";
import { fetchApiData, fetchApiEnvelope } from "@/lib/api";
import {
  formatAngka,
  formatBulan,
  formatPersen,
  formatPersenBertanda,
  formatTanggal,
  statusHarga,
} from "@/lib/format";
import type {
  HargaPoint,
  HargaTerkini,
  Ketersediaan,
  Peringkat,
  RingkasanData,
  StatistikPeriode,
  StatusKetersediaan,
} from "@/lib/types";

async function ambilData() {
  const [ringkasan, hargaBulanan, terkini, naik, turun, status, statistik, riwayat] =
    await Promise.all([
      fetchApiEnvelope<RingkasanData>("/ringkasan"),
      fetchApiData<HargaPoint[]>("/harga?agregasi=bulanan"),
      fetchApiData<HargaTerkini[]>("/harga/terkini"),
      fetchApiData<Peringkat[]>("/peringkat?arah=naik&hari=30"),
      fetchApiData<Peringkat[]>("/peringkat?arah=turun&hari=30"),
      fetchApiData<StatusKetersediaan>("/ketersediaan/status-terkini"),
      fetchApiData<StatistikPeriode[]>("/periode/statistik"),
      fetchApiData<Ketersediaan[]>("/ketersediaan?jenis=riwayat"),
    ]);
  return { ringkasan, hargaBulanan, terkini, naik, turun, status, statistik, riwayat };
}

export async function RingkasanSection() {
  const { ringkasan, hargaBulanan, terkini, naik, turun, status, statistik, riwayat } =
    await ambilData();
  const data = ringkasan.data;
  const indeks = buildAverageIndex(hargaBulanan);
  const ringkas = ringkasAngka(indeks.map((point) => point.indeks));
  const titikTertinggi = indeks.reduce(
    (tertinggi, point) => (point.indeks > (tertinggi?.indeks ?? -Infinity) ? point : tertinggi),
    indeks[0],
  );
  const perubahan =
    indeks.length > 1
      ? ((indeks[indeks.length - 1].indeks - indeks[0].indeks) / indeks[0].indeks) * 100
      : 0;
  const prediksi = data.prediksi_periode_berikutnya;
  // Komoditas dengan median kenaikan tertinggi pada periode berikutnya.
  const teratas = statistik
    .filter((item) => item.periode_nama === prediksi?.periode_nama)
    .sort((a, b) => b.median_persen - a.median_persen)[0];
  const donut = [
    { name: "Surplus", value: status.jumlah.surplus, color: "#1E7A3E" },
    { name: "Seimbang", value: status.jumlah.seimbang, color: "#1F6FA8" },
    { name: "Defisit", value: status.jumlah.defisit, color: "#B3261E" },
  ];

  // Deret indeks 12 bulan terakhir: definisinya sama dengan nilai kartu
  // (rata-rata indeks 10 komoditas, harga awal periode = 100).
  const deretIndeks = indeks
    .slice(-12)
    .map((point) => ({ label: formatBulan(point.tanggal), nilai: point.indeks }));
  const nilaiKartuIndeks = data.indeks_harga_pangan.nilai;
  const nilaiAkhirIndeks = deretIndeks.at(-1)?.nilai ?? null;
  const indeksCocok =
    nilaiAkhirIndeks !== null &&
    Math.abs(nilaiAkhirIndeks - nilaiKartuIndeks) <= Math.max(0.5, nilaiKartuIndeks * 0.02);

  // Deret jumlah komoditas defisit per bulan, hanya komoditas utama dan
  // riwayat (tanpa proyeksi), agar definisinya sama dengan nilai kartu.
  const idUtama = new Set(status.komoditas.map((item) => item.komoditas_id));
  const perBulan = new Map<string, number>();
  const daftarBulan = new Set<string>();
  for (const row of riwayat) {
    if (row.jenis_data !== "riwayat" || !idUtama.has(row.komoditas_id)) continue;
    daftarBulan.add(row.bulan);
    if (row.status_neraca === "Defisit") {
      perBulan.set(row.bulan, (perBulan.get(row.bulan) ?? 0) + 1);
    }
  }
  const deretDefisit = [...daftarBulan]
    .sort()
    .slice(-12)
    .map((bulan) => ({ label: formatBulan(bulan), nilai: perBulan.get(bulan) ?? 0 }));
  const defisitCocok =
    deretDefisit.at(-1)?.nilai === data.komoditas_defisit_bulan_terbaru.jumlah &&
    deretDefisit.length > 1;
  const defisitBulanLalu = deretDefisit.at(-2)?.nilai ?? null;

  const statusIndeks = statusHarga(nilaiKartuIndeks - data.indeks_harga_pangan.awal_periode);
  const statusDefisit =
    data.komoditas_defisit_bulan_terbaru.jumlah > 0 ? "Defisit" : "Seimbang";

  return (
    <>
      <PageHeader
        eyebrow="Kota Bandung"
        title="Ringkasan Harga Pangan"
        description="Gambaran cepat harga 10 komoditas utama, ketersediaan pangan, dan perkiraan periode berikutnya."
        actions={
          <Link href="/?bagian=tren" className={buttonClasses({ variant: "secondary", size: "sm" })}>
            Lihat tren lengkap <ArrowUpRight size={16} />
          </Link>
        }
      />

      <Section
        title="Ringkasan cepat"
        note="Empat angka utama hari ini. Naik berarti harga lebih mahal bagi pembeli."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
          <KpiCard
            title="Indeks Harga Pangan"
            value={formatAngka(nilaiKartuIndeks, 1)}
            reference={`Harga ${data.indeks_harga_pangan.jumlah_komoditas} komoditas, awal periode = 100`}
            chip={<StatusChip status={statusIndeks} />}
            delta={{
              value: nilaiKartuIndeks - data.indeks_harga_pangan.awal_periode,
              label: "dibanding awal periode",
            }}
            sparkline={
              indeksCocok && nilaiAkhirIndeks !== null ? (
                <Sparkline
                  data={deretIndeks}
                  format={(nilai) => formatAngka(nilai, 1)}
                  ariaLabel={`Indeks harga pangan 12 bulan terakhir: dari ${deretIndeks[0]?.label} sampai ${deretIndeks.at(-1)?.label}, nilai terakhir ${formatAngka(nilaiAkhirIndeks, 1)}`}
                />
              ) : undefined
            }
            icon={Gauge}
            tooltip="Rata-rata indeks 10 komoditas utama. Harga pertama dalam periode dianggap 100."
          />
          <KpiCard
            title="Komoditas Naik"
            value={`${data.komoditas_naik_30_hari.jumlah} dari ${data.komoditas_naik_30_hari.dari}`}
            reference="Harga naik pada 30 hari terakhir"
            chip={
              <StatusChip status={data.komoditas_naik_30_hari.jumlah > 0 ? "Naik" : "Stabil"} />
            }
            icon={TrendingUp}
            tooltip="Jumlah komoditas utama yang harganya naik dibanding 30 hari sebelumnya."
          />
          <KpiCard
            title="Komoditas Defisit"
            value={`${data.komoditas_defisit_bulan_terbaru.jumlah} dari ${data.komoditas_defisit_bulan_terbaru.total_komoditas}`}
            reference={`Bulan ${formatBulan(data.komoditas_defisit_bulan_terbaru.bulan)}`}
            chip={<StatusChip status={statusDefisit} />}
            delta={
              defisitCocok && defisitBulanLalu !== null
                ? {
                    value:
                      data.komoditas_defisit_bulan_terbaru.jumlah - defisitBulanLalu,
                    label: "dibanding bulan lalu",
                  }
                : undefined
            }
            sparkline={
              defisitCocok ? (
                <Sparkline
                  data={deretDefisit}
                  format={(nilai) => `${formatAngka(nilai, 0)} komoditas`}
                  ariaLabel={`Jumlah komoditas defisit 12 bulan terakhir: dari ${deretDefisit[0]?.label} sampai ${deretDefisit.at(-1)?.label}, terakhir ${data.komoditas_defisit_bulan_terbaru.jumlah} komoditas`}
                />
              ) : undefined
            }
            icon={PackageX}
            tooltip="Status neraca: defisit bila pasokan kurang dari kebutuhan sebesar 5% atau lebih."
          />
          <KpiCard
            title={teratas ? `Prediksi ${teratas.nama}` : `Prediksi ${prediksi?.periode_nama ?? "periode berikutnya"}`}
            value={formatPersenBertanda(teratas?.median_persen ?? prediksi?.median_persen ?? null)}
            reference={
              prediksi
                ? `Perkiraan saat ${prediksi.periode_nama}, mulai ${formatTanggal(prediksi.tanggal_mulai)}`
                : "Perkiraan periode berikutnya"
            }
            chip={
              <StatusChip
                status={statusHarga(teratas?.median_persen ?? prediksi?.median_persen ?? null)}
              />
            }
            delta={
              prediksi
                ? {
                    value: teratas?.median_persen ?? prediksi.median_persen,
                    angka: `${formatPersen(teratas?.min_persen ?? prediksi.min_persen)} – ${formatPersen(teratas?.maks_persen ?? prediksi.maks_persen)}`,
                    label: `rentang ${teratas?.jumlah_kejadian ?? prediksi.jumlah_komoditas} kejadian`,
                  }
                : undefined
            }
            icon={Sparkles}
            tooltip="Median kenaikan tertinggi di antara 10 komoditas pada periode berikutnya. Perkiraan dari pola historis, bukan jaminan."
          />
        </div>
      </Section>

      <Section
        title="Tren dan pasokan"
        note="Indeks 10 komoditas sepanjang 12 bulan dan status neraca bulan terbaru."
      >
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12">
          <ChartCard
            className="xl:col-span-8"
            title="Tren Indeks Harga Pangan"
            description="Rata-rata 10 komoditas utama, bulanan. Awal periode = 100."
            summary={`Grafik indeks harga pangan dari ${formatTanggal(indeks[0]?.tanggal)} sampai ${formatTanggal(indeks.at(-1)?.tanggal)}.`}
            source="Sumber: Bank Indonesia – PIHPS Nasional"
            table={
              <TrendTable
                data={indeks}
                series={[{ key: "indeks", label: "Indeks", color: "#2B7A4B" }]}
                mode="indeks"
              />
            }
            footer={
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Metric
                  label="Rata-rata indeks"
                  value={formatAngka(ringkas.rataRata, 1)}
                  hint="Sepanjang periode"
                />
                <Metric
                  label="Tertinggi"
                  value={formatAngka(ringkas.tertinggi, 1)}
                  hint={titikTertinggi ? formatTanggal(titikTertinggi.tanggal) : undefined}
                />
                <Metric
                  label="Perubahan periode"
                  value={formatPersenBertanda(perubahan)}
                  hint="Dari titik awal ke terakhir"
                />
              </div>
            }
          >
            <TrendChart
              data={indeks}
              series={[{ key: "indeks", label: "Indeks 10 komoditas", color: "#2B7A4B" }]}
              mode="indeks"
              showArea
              height={300}
            />
          </ChartCard>

          <Card className="xl:col-span-4">
            <CardHeader
              title="Status Ketersediaan"
              description={`Bulan ${formatBulan(status.bulan)} · ${status.total} komoditas`}
            />
            <DonutChart data={donut} totalLabel="komoditas" />
            <ul className="mt-2 space-y-2" aria-label="Legenda status ketersediaan">
              {donut.map((item) => (
                <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-ink-muted">
                    <span
                      aria-hidden="true"
                      className="size-3 rounded-[3px]"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </span>
                  <span className="font-semibold tabular-nums text-ink">{item.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-line pt-3 text-sm leading-5 text-ink-muted">
              Aturan: Surplus ≥ +5%, Defisit ≤ −5%, selain itu Seimbang.
            </p>
          </Card>
        </div>
      </Section>

      <Section
        title="Rincian komoditas"
        note="Peringkat perubahan 30 hari terakhir dan harga terkini tiap komoditas utama."
      >
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-5">
            <CardHeader
              title="Paling Naik & Paling Turun"
              description="Perubahan harga 30 hari terakhir"
            />
            <RankingList naik={naik} turun={turun} />
          </Card>

          <Card className="xl:col-span-7">
            <CardHeader
              title="Tabel Harga Komoditas"
              description={`Harga terkini per ${formatTanggal(terkini[0]?.tanggal_terkini)}`}
              action={
                <Link
                  href="/?bagian=tren"
                  className={buttonClasses({ variant: "ghost", size: "sm" })}
                >
                  Buka tren
                </Link>
              }
            />
            <PriceTable data={terkini} />
          </Card>
        </div>
      </Section>

      <footer className="mt-8 border-t border-line pt-4 text-sm leading-5 text-ink-muted">
        Sumber harga: {ringkasan.meta.sumber}. Data terakhir:{" "}
        {formatTanggal(ringkasan.meta.tanggal_data_terakhir)}. Nilai kosong ditampilkan sebagai
        tanda “–”, bukan nol.
      </footer>
    </>
  );
}
