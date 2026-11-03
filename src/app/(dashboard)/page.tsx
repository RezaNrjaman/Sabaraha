import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Gauge,
  PackageX,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { ChartFrame } from "@/components/charts/chart-frame";
import { DonutChart } from "@/components/charts/donut-chart";
import { TrendChart } from "@/components/charts/trend-chart";
import { TrendTable } from "@/components/charts/trend-table";
import { KpiCard, Metric } from "@/components/dashboard/kpi-card";
import { PriceTable } from "@/components/dashboard/price-table";
import { RankingList } from "@/components/dashboard/ranking-list";
import { Chip } from "@/components/ui/status-chip";
import { Card, CardHeader } from "@/components/ui/card";
import { ChangeChip } from "@/components/ui/status-chip";
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
} from "@/lib/format";
import type {
  HargaTerkini,
  Peringkat,
  RingkasanData,
  StatistikPeriode,
  StatusKetersediaan,
} from "@/lib/types";

export const metadata = {
  title: "Ringkasan",
};

async function ambilData() {
  const ringkasan = await fetchApiEnvelope<RingkasanData>("/ringkasan");
  const hargaBulanan = await fetchApiData<import("@/lib/types").HargaPoint[]>(
    "/harga?agregasi=bulanan",
  );
  const terkini = await fetchApiData<HargaTerkini[]>("/harga/terkini");
  const naik = await fetchApiData<Peringkat[]>("/peringkat?arah=naik&hari=30");
  const turun = await fetchApiData<Peringkat[]>("/peringkat?arah=turun&hari=30");
  const status = await fetchApiData<StatusKetersediaan>(
    "/ketersediaan/status-terkini",
  );
  const statistik = await fetchApiData<StatistikPeriode[]>("/periode/statistik");
  return { ringkasan, hargaBulanan, terkini, naik, turun, status, statistik };
}

export default async function RingkasanPage() {
  const { ringkasan, hargaBulanan, terkini, naik, turun, status, statistik } =
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
    .filter((item) => item.periode_nama === prediksi.periode_nama)
    .sort((a, b) => b.median_persen - a.median_persen)[0];
  const donut = [
    { name: "Surplus", value: status.jumlah.surplus, color: "#1E7A3E" },
    { name: "Seimbang", value: status.jumlah.seimbang, color: "#1F6FA8" },
    { name: "Defisit", value: status.jumlah.defisit, color: "#B3261E" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Kota Bandung"
        title="Ringkasan Harga Pangan"
        description="Gambaran cepat harga 10 komoditas utama, ketersediaan pangan, dan perkiraan periode berikutnya."
        actions={
          <Link href="/tren" className={buttonClasses({ variant: "secondary", size: "sm" })}>
            Lihat tren lengkap <ArrowUpRight size={16} />
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Indeks Harga Pangan"
          value={formatAngka(data.indeks_harga_pangan.nilai, 1)}
          icon={Gauge}
          hint={`${formatTanggal(data.indeks_harga_pangan.periode.dari)} – ${formatTanggal(data.indeks_harga_pangan.periode.sampai)}`}
          footer={<ChangeChip value={data.indeks_harga_pangan.nilai - 100} label="dari awal periode" />}
          tooltip="Rata-rata indeks 10 komoditas utama. Harga pertama dalam periode dianggap 100."
        />
        <KpiCard
          label="Komoditas Naik"
          value={`${data.komoditas_naik_30_hari.jumlah} dari ${data.komoditas_naik_30_hari.dari}`}
          icon={TrendingUp}
          tone="naik"
          hint="Dibanding 30 hari lalu"
          footer={
            <Chip tone="netral" icon={<CalendarDays size={14} />}>
              30 hari terakhir
            </Chip>
          }
        />
        <KpiCard
          label="Komoditas Defisit"
          value={`${data.komoditas_defisit_bulan_terbaru.jumlah} dari ${data.komoditas_defisit_bulan_terbaru.total_komoditas}`}
          icon={PackageX}
          tone="defisit"
          hint={`Bulan ${formatBulan(data.komoditas_defisit_bulan_terbaru.bulan)}`}
          tooltip="Status neraca: defisit bila rasio neraca ≤ −5%."
        />
        <KpiCard
          label={teratas ? `Prediksi ${teratas.nama}` : `Prediksi ${prediksi.periode_nama}`}
          value={formatPersenBertanda(teratas?.median_persen ?? prediksi.median_persen)}
          icon={Sparkles}
          tone="seimbang"
          hint={`Perkiraan saat ${prediksi.periode_nama}, mulai ${formatTanggal(prediksi.tanggal_mulai)}`}
          footer={
            <span className="text-sm text-ink-muted">
              Rentang {formatPersen(teratas?.min_persen ?? prediksi.min_persen)} –{" "}
              {formatPersen(teratas?.maks_persen ?? prediksi.maks_persen)}
            </span>
          }
          tooltip="Median kenaikan tertinggi di antara 10 komoditas pada periode berikutnya. Perkiraan dari pola historis, bukan jaminan."
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <ChartFrame
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
        >
          <TrendChart
            data={indeks}
            series={[{ key: "indeks", label: "Indeks 10 komoditas", color: "#2B7A4B" }]}
            mode="indeks"
            showArea
            height={300}
          />
        </ChartFrame>

        <Card className="xl:col-span-4">
          <CardHeader
            title="Status Ketersediaan"
            description={`Bulan ${formatBulan(status.bulan)}`}
          />
          <DonutChart data={donut} totalLabel="komoditas" />
          <ul className="mt-2 space-y-2" aria-label="Legenda status ketersediaan">
            {donut.map((item) => (
              <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-ink-muted">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-semibold text-ink">{item.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 border-t border-line pt-4 sm:grid-cols-3">
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

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
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
              <Link href="/tren" className={buttonClasses({ variant: "ghost", size: "sm" })}>
                Buka tren
              </Link>
            }
          />
          <PriceTable data={terkini} />
        </Card>
      </div>

      <p className="mt-6 text-xs leading-5 text-ink-muted">
        Sumber harga: {ringkasan.meta.sumber}. Data terakhir:{" "}
        {formatTanggal(ringkasan.meta.tanggal_data_terakhir)}. Nilai kosong ditampilkan
        sebagai tanda “-”, bukan nol.
      </p>
    </>
  );
}
