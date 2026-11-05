import { Package } from "lucide-react";

import { ChartFrame } from "@/components/charts/chart-frame";
import { DonutChart } from "@/components/charts/donut-chart";
import { GroupedBarChart } from "@/components/charts/grouped-bar-chart";
import { FilterChips, ResetFilter } from "@/components/filters/filter-chips";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ProjectionChip, StatusChip } from "@/components/ui/status-chip";
import { fetchApiData } from "@/lib/api";
import { ambilDaftar } from "@/lib/filters";
import { formatBulan, formatHari, formatPersen, formatTon } from "@/lib/format";
import { buildQuery, bulanSebelum, pilihanParam } from "@/lib/query";
import type {
  InfoData,
  Ketersediaan,
  Komoditas,
  StatusKetersediaan,
} from "@/lib/types";

// Rentang data ketersediaan. "riwayat" memakai bulan riwayat terakhir,
// "proyeksi" menampilkan simulasi mendatang s.d. Des 2032.
const OPSI_RENTANG = [
  { value: "12", label: "12 bulan (riwayat)" },
  { value: "36", label: "3 tahun (riwayat)" },
  { value: "riwayat", label: "Riwayat penuh" },
  { value: "proyeksi", label: "Proyeksi 2026–2032" },
  { value: "semua", label: "Semua 2021–2032" },
];

const RENTANG_SAH = OPSI_RENTANG.map((opsi) => opsi.value);

export async function KetersediaanSection({
  sp,
}: {
  sp: Record<string, string | string[] | undefined>;
}) {
  const info = await fetchApiData<InfoData>("/info");
  const semuaKomoditas = await fetchApiData<Komoditas[]>("/komoditas");
  const status = await fetchApiData<StatusKetersediaan>("/ketersediaan/status-terkini");
  const utama = semuaKomoditas.filter((item) => item.is_utama);
  const namaUtama = utama.map((item) => item.nama);
  const bawaan = namaUtama.includes("Beras") ? "Beras" : (namaUtama[0] ?? "Beras");
  const [dipilih] = ambilDaftar(sp.komoditas, [bawaan]);
  const namaAman = namaUtama.includes(dipilih) ? dipilih : bawaan;
  const rentang = RENTANG_SAH.includes(pilihanParam(sp.rentang, "12"))
    ? pilihanParam(sp.rentang, "12")
    : "12";

  // Susun query sesuai rentang. Proyeksi dan semua tidak dibatasi tanggal;
  // riwayat dibatasi bulan riwayat terakhir agar tidak ikut proyeksi.
  let jenis: "riwayat" | "proyeksi" | undefined;
  let dari: string | undefined;
  let sampai: string | undefined;
  if (rentang === "proyeksi") {
    jenis = "proyeksi";
  } else if (rentang === "semua") {
    jenis = undefined;
  } else {
    jenis = "riwayat";
    sampai = info.tanggal_data_terakhir;
    dari = rentang === "riwayat" ? undefined : bulanSebelum(sampai, Number(rentang));
  }

  const rows = await fetchApiData<Ketersediaan[]>(
    `/ketersediaan${buildQuery({ komoditas: namaAman, jenis, dari, sampai })}`,
  );
  const menampilkanProyeksi = rows.some((row) => row.jenis_data === "proyeksi");
  const campuran = menampilkanProyeksi && rows.some((row) => row.jenis_data === "riwayat");
  const labelRentang = OPSI_RENTANG.find((opsi) => opsi.value === rentang)?.label ?? "12 bulan";

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
        eyebrow="Pasokan pangan"
        title="Ketersediaan Pangan"
        description="Status neraca, pasokan, kebutuhan, dan ketahanan stok per bulan."
        actions={<ResetFilter href="/?bagian=ketersediaan" />}
      />

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
            <p className="mb-2 text-sm font-semibold text-ink">Rentang data</p>
            <FilterChips
              param="rentang"
              label="Rentang data ketersediaan"
              options={OPSI_RENTANG}
              selected={[rentang]}
            />
          </div>
        </div>
      </Card>

      {menampilkanProyeksi ? (
        <div className="mb-6 flex items-start gap-3 rounded-card border border-primary-200 bg-primary-50 p-4">
          <ProjectionChip />
          <p className="text-sm leading-6 text-ink">
            Menampilkan <span className="font-semibold">{labelRentang}</span>. Bagian{" "}
            <span className="font-semibold">proyeksi</span> (Nov 2026–Des 2032) merupakan proyeksi
            tren, bukan ramalan resmi. Status neraca terkini di atas tetap memakai bulan riwayat
            terakhir (Okt 2026), tidak termasuk proyeksi.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader
            title="Status Ketersediaan"
            description={`Bulan ${formatBulan(status.bulan)} · ${status.total} komoditas`}
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
          <p className="mt-4 border-t border-line pt-3 text-sm leading-5 text-ink-muted">
            Aturan: Surplus ≥ +5%, Defisit ≤ −5%, selain itu Seimbang.
          </p>
        </Card>

        <Card className="xl:col-span-7">
          <CardHeader
            title="Status per Komoditas"
            description={`Bulan riwayat terbaru ${formatBulan(status.bulan)}`}
          />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {status.komoditas.map((item) => (
              <div key={item.komoditas_id} className="min-w-0 rounded-ctl border border-line p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="min-w-0 font-semibold leading-5 text-ink">{item.nama}</p>
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
          <EmptyState actionHref="/?bagian=ketersediaan" />
        </div>
      ) : (
        <>
          <ChartFrame
            className="mt-6"
            title={`Pasokan vs Kebutuhan ${namaAman}`}
            description={`Per bulan, dalam ton. Rentang: ${labelRentang}.`}
            summary={`Grafik batang pasokan dan kebutuhan ${namaAman} per bulan dari ${formatBulan(rows[0]?.bulan)} sampai ${formatBulan(rows.at(-1)?.bulan)}.`}
            table={
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead className="sticky top-0 bg-bg text-left text-ink-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Bulan</th>
                    <th className="px-3 py-2 font-medium">Pasokan</th>
                    <th className="px-3 py-2 font-medium">Kebutuhan</th>
                    <th className="px-3 py-2 font-medium">Stok akhir</th>
                    {campuran ? <th className="px-3 py-2 font-medium">Jenis</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.bulan} className="border-t border-line">
                      <td className="px-3 py-2">{formatBulan(row.bulan)}</td>
                      <td className="px-3 py-2">{formatTon(row.pasokan_ton)}</td>
                      <td className="px-3 py-2">{formatTon(row.kebutuhan_ton)}</td>
                      <td className="px-3 py-2">{formatTon(row.stok_akhir_ton)}</td>
                      {campuran ? (
                        <td className="px-3 py-2">
                          {row.jenis_data === "proyeksi" ? "Proyeksi" : "Riwayat"}
                        </td>
                      ) : null}
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
              description={`Sisa stok pada akhir bulan, dalam ton. Rentang: ${labelRentang}.`}
              summary={`Grafik stok akhir ${namaAman} per bulan dari ${formatBulan(rows[0]?.bulan)} sampai ${formatBulan(rows.at(-1)?.bulan)}.`}
              table={
                <table className="w-full min-w-[420px] border-collapse text-sm">
                  <thead className="sticky top-0 bg-bg text-left text-ink-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium">Bulan</th>
                      <th className="px-3 py-2 font-medium">Stok akhir</th>
                      <th className="px-3 py-2 font-medium">Ketahanan</th>
                      {campuran ? <th className="px-3 py-2 font-medium">Jenis</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.bulan} className="border-t border-line">
                        <td className="px-3 py-2">{formatBulan(row.bulan)}</td>
                        <td className="px-3 py-2">{formatTon(row.stok_akhir_ton)}</td>
                        <td className="px-3 py-2">{formatHari(row.ketahanan_stok_hari)}</td>
                        {campuran ? (
                          <td className="px-3 py-2">
                            {row.jenis_data === "proyeksi" ? "Proyeksi" : "Riwayat"}
                          </td>
                        ) : null}
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
                title={
                  menampilkanProyeksi && statusDipilih?.jenis_data === "proyeksi"
                    ? "Ringkasan Bulan Proyeksi"
                    : "Ringkasan Bulan Terbaru"
                }
                description={statusDipilih ? formatBulan(statusDipilih.bulan) : "-"}
                action={
                  statusDipilih?.jenis_data === "proyeksi" ? <ProjectionChip /> : null
                }
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
            </Card>
          </div>
        </>
      )}

      <div className="mt-6 flex items-start gap-2 text-sm leading-5 text-ink-muted">
        <Package size={15} className="mt-0.5 shrink-0" />
        <p>Sumber harga: {info.sumber}.</p>
      </div>
    </>
  );
}
