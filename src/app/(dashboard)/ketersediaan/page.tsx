import { Package, ShieldCheck } from "lucide-react";

import { ChartFrame } from "@/components/charts/chart-frame";
import { DonutChart } from "@/components/charts/donut-chart";
import { GroupedBarChart } from "@/components/charts/grouped-bar-chart";
import { SimulationBanner } from "@/components/dashboard/simulation-banner";
import { FilterChips, ResetFilter } from "@/components/filters/filter-chips";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SimulationChip, StatusChip } from "@/components/ui/status-chip";
import { fetchApiData } from "@/lib/api";
import { ambilDaftar } from "@/lib/filters";
import { formatBulan, formatHari, formatPersen, formatTon } from "@/lib/format";
import { buildQuery, bulanSebelum } from "@/lib/query";
import type {
  InfoData,
  Ketersediaan,
  Komoditas,
  StatusKetersediaan,
} from "@/lib/types";

export const metadata = {
  title: "Ketersediaan",
};

const OPSI_BULAN = [
  { value: "12", label: "12 bulan" },
  { value: "36", label: "3 tahun" },
  { value: "72", label: "Semua data" },
];

export default async function KetersediaanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const info = await fetchApiData<InfoData>("/info");
  const semuaKomoditas = await fetchApiData<Komoditas[]>("/komoditas");
  const status = await fetchApiData<StatusKetersediaan>("/ketersediaan/status-terkini");
  const utama = semuaKomoditas.filter((item) => item.is_utama);
  const namaUtama = utama.map((item) => item.nama);
  const bawaan = namaUtama.includes("Beras") ? "Beras" : (namaUtama[0] ?? "Beras");
  const [dipilih] = ambilDaftar(sp.komoditas, [bawaan]);
  const namaAman = namaUtama.includes(dipilih) ? dipilih : bawaan;
  const jumlahBulan = [12, 36, 72].includes(Number(sp.bulan)) ? Number(sp.bulan) : 12;
  const sampai = info.tanggal_data_terakhir;
  const dari = bulanSebelum(sampai, jumlahBulan);
  const rows = await fetchApiData<Ketersediaan[]>(
    `/ketersediaan${buildQuery({ komoditas: namaAman, dari, sampai })}`,
  );
  const donut = [
    { name: "Surplus", value: status.jumlah.surplus, color: "#1E7A3E" },
    { name: "Seimbang", value: status.jumlah.seimbang, color: "#1F6FA8" },
    { name: "Defisit", value: status.jumlah.defisit, color: "#B3261E" },
  ];
  const dataBulanan = rows.map((row) => ({
    bulan: row.bulan,
    pasokan_ton: row.pasokan_ton,
    kebutuhan_ton: row.kebutuhan_ton,
    stok_akhir_ton: row.stok_akhir_ton,
  }));
  const dataStok = rows.map((row) => ({
    bulan: row.bulan,
    stok_akhir_ton: row.stok_akhir_ton,
  }));
  const statusDipilih = rows.at(-1);

  return (
    <>
      <PageHeader
        eyebrow="Pasokan pangan (simulasi)"
        title="Ketersediaan Pangan"
        description="Status neraca, pasokan, kebutuhan, dan ketahanan stok. Semua angka di halaman ini adalah simulasi untuk demonstrasi."
        actions={<ResetFilter href="/ketersediaan" />}
      />

      <div className="mb-6">
        <SimulationBanner />
      </div>

      <Card className="mb-6">
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Komoditas</p>
            <FilterChips
              param="komoditas"
              label="Pilih komoditas ketersediaan"
              options={utama.map((item) => ({ value: item.nama, label: item.nama }))}
              selected={[namaAman]}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Rentang bulan</p>
            <FilterChips
              param="bulan"
              label="Rentang bulan ketersediaan"
              options={OPSI_BULAN}
              selected={[String(jumlahBulan)]}
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader
            title="Status Ketersediaan"
            description={`Bulan ${formatBulan(status.bulan)} · ${status.total} komoditas`}
            action={<SimulationChip />}
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
          <p className="mt-4 border-t border-line pt-3 text-xs leading-5 text-ink-muted">
            Aturan: Surplus ≥ +5%, Defisit ≤ −5%, selain itu Seimbang. Data simulasi, bukan
            data resmi pasokan Kota Bandung.
          </p>
        </Card>

        <Card className="xl:col-span-7">
          <CardHeader
            title="Status per Komoditas"
            description={`Bulan terbaru ${formatBulan(status.bulan)}`}
            action={<SimulationChip />}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {status.komoditas.map((item) => (
              <div key={item.komoditas_id} className="rounded-ctl border border-line p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{item.nama}</p>
                  <StatusChip status={item.status_neraca} />
                </div>
                <p className="mt-2 text-sm text-ink-muted">
                  Rasio neraca {formatPersen(item.rasio_neraca_persen)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState actionHref="/ketersediaan" />
        </div>
      ) : (
        <>
          <ChartFrame
            className="mt-6"
            title={`Pasokan vs Kebutuhan ${namaAman}`}
            description="Per bulan, dalam ton. Data simulasi."
            summary={`Grafik batang pasokan dan kebutuhan ${namaAman} per bulan dari ${formatBulan(rows[0]?.bulan)} sampai ${formatBulan(rows.at(-1)?.bulan)}.`}
            table={
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead className="sticky top-0 bg-bg text-left text-ink-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Bulan</th>
                    <th className="px-3 py-2 font-medium">Pasokan</th>
                    <th className="px-3 py-2 font-medium">Kebutuhan</th>
                    <th className="px-3 py-2 font-medium">Stok akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.bulan} className="border-t border-line">
                      <td className="px-3 py-2">{formatBulan(row.bulan)}</td>
                      <td className="px-3 py-2">{formatTon(row.pasokan_ton)}</td>
                      <td className="px-3 py-2">{formatTon(row.kebutuhan_ton)}</td>
                      <td className="px-3 py-2">{formatTon(row.stok_akhir_ton)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          >
            <GroupedBarChart
              data={dataBulanan}
              xKey="bulan"
              bars={[
                { key: "pasokan_ton", label: "Pasokan", color: "#2B7A4B" },
                { key: "kebutuhan_ton", label: "Kebutuhan", color: "#C2410C" },
              ]}
              xFormat="bulan"
              yFormat="ton"
              height={300}
            />
          </ChartFrame>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
            <ChartFrame
              className="xl:col-span-8"
              title={`Stok Akhir ${namaAman}`}
              description="Sisa stok pada akhir bulan, dalam ton. Data simulasi."
              summary={`Grafik stok akhir ${namaAman} per bulan dari ${formatBulan(rows[0]?.bulan)} sampai ${formatBulan(rows.at(-1)?.bulan)}.`}
              table={
                <table className="w-full min-w-[420px] border-collapse text-sm">
                  <thead className="sticky top-0 bg-bg text-left text-ink-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium">Bulan</th>
                      <th className="px-3 py-2 font-medium">Stok akhir</th>
                      <th className="px-3 py-2 font-medium">Ketahanan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.bulan} className="border-t border-line">
                        <td className="px-3 py-2">{formatBulan(row.bulan)}</td>
                        <td className="px-3 py-2">{formatTon(row.stok_akhir_ton)}</td>
                        <td className="px-3 py-2">{formatHari(row.ketahanan_stok_hari)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            >
              <GroupedBarChart
                data={dataStok}
                xKey="bulan"
                bars={[{ key: "stok_akhir_ton", label: "Stok akhir", color: "#1F6FA8" }]}
                xFormat="bulan"
                yFormat="ton"
                height={300}
              />
            </ChartFrame>

            <Card className="xl:col-span-4">
              <CardHeader
                title="Ringkasan Bulan Terbaru"
                description={statusDipilih ? formatBulan(statusDipilih.bulan) : "-"}
                action={<SimulationChip />}
              />
              <dl className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">Pasokan</dt>
                  <dd className="font-semibold text-ink">
                    {statusDipilih ? formatTon(statusDipilih.pasokan_ton) : "-"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">Kebutuhan</dt>
                  <dd className="font-semibold text-ink">
                    {statusDipilih ? formatTon(statusDipilih.kebutuhan_ton) : "-"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">Neraca</dt>
                  <dd className="font-semibold text-ink">
                    {statusDipilih ? formatTon(statusDipilih.neraca_ton) : "-"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">Ketahanan stok</dt>
                  <dd className="font-semibold text-ink">
                    {statusDipilih ? formatHari(statusDipilih.ketahanan_stok_hari) : "-"}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex items-start gap-2 rounded-ctl bg-perhatian-bg px-3 py-2 text-sm text-perhatian">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                <p>
                  Data simulasi tidak boleh dipakai sebagai bukti hubungan sebab-akibat harga
                  dan pasokan.
                </p>
              </div>
            </Card>
          </div>
        </>
      )}

      <div className="mt-6 flex items-start gap-2 text-xs leading-5 text-ink-muted">
        <Package size={15} className="mt-0.5 shrink-0" />
        <p>
          Sumber harga: {info.sumber}. Data ketersediaan adalah simulasi yang dibuat untuk
          demonstrasi, bukan data resmi.
        </p>
      </div>
    </>
  );
}
