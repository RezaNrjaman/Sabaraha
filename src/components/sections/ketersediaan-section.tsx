import { FilterChips, ResetFilter } from "@/components/filters/filter-chips";
import { GroupedBarChart } from "@/components/charts/grouped-bar-chart";
import { Card, CardHeader } from "@/components/ui/card";
import { ChartCard } from "@/components/ui/chart-card";
import { DataTable, type KolomDataTable } from "@/components/ui/data-table";
import { DonutChart } from "@/components/charts/donut-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar, FilterGroup } from "@/components/ui/filter-bar";
import { PageFooter } from "@/components/ui/page-footer";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
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
  const [info, semuaKomoditas, status] = await Promise.all([
    fetchApiData<InfoData>("/info"),
    fetchApiData<Komoditas[]>("/komoditas"),
    fetchApiData<StatusKetersediaan>("/ketersediaan/status-terkini"),
  ]);
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
  const dataBulanan = rows.map((row) => ({
    bulan: row.bulan,
    pasokan_ton: row.pasokan_ton,
    kebutuhan_ton: row.kebutuhan_ton,
  }));
  const dataStok = rows.map((row) => ({ bulan: row.bulan, stok_akhir_ton: row.stok_akhir_ton }));
  const statusDipilih = rows.at(-1);
  const labelRentang = OPSI_RENTANG.find((opsi) => opsi.value === rentang)?.label ?? "12 bulan";
  const donut = [
    { name: "Surplus", value: status.jumlah.surplus, color: "#1E7A3E" },
    { name: "Seimbang", value: status.jumlah.seimbang, color: "#1F6FA8" },
    { name: "Defisit", value: status.jumlah.defisit, color: "#B3261E" },
  ];

  const kolomPasokan: KolomDataTable<Ketersediaan>[] = [
    {
      key: "bulan",
      header: "Bulan",
      rata: "kiri",
      utama: true,
      isi: (row) => <span className="font-medium text-ink">{formatBulan(row.bulan)}</span>,
    },
    { key: "pasokan", header: "Pasokan", isi: (row) => formatTon(row.pasokan_ton) },
    { key: "kebutuhan", header: "Kebutuhan", isi: (row) => formatTon(row.kebutuhan_ton) },
    { key: "stok", header: "Stok akhir", isi: (row) => formatTon(row.stok_akhir_ton) },
  ];
  if (campuran) {
    kolomPasokan.push({
      key: "jenis",
      header: "Jenis",
      rata: "kiri",
      isi: (row) => (row.jenis_data === "proyeksi" ? "Proyeksi" : "Riwayat"),
    });
  }

  const kolomStok: KolomDataTable<Ketersediaan>[] = [
    {
      key: "bulan",
      header: "Bulan",
      rata: "kiri",
      utama: true,
      isi: (row) => <span className="font-medium text-ink">{formatBulan(row.bulan)}</span>,
    },
    { key: "stok", header: "Stok akhir", isi: (row) => formatTon(row.stok_akhir_ton) },
    { key: "ketahanan", header: "Ketahanan", isi: (row) => formatHari(row.ketahanan_stok_hari) },
  ];
  if (campuran) {
    kolomStok.push({
      key: "jenis",
      header: "Jenis",
      rata: "kiri",
      isi: (row) => (row.jenis_data === "proyeksi" ? "Proyeksi" : "Riwayat"),
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="Pasokan pangan"
        title="Ketersediaan Pangan"
        description="Simulasi pasokan, kebutuhan, dan status neraca tiap komoditas utama di Kota Bandung."
      />

      <Section title="Saringan data" note="Pilih komoditas dan rentang data yang ditampilkan.">
        <FilterBar reset={<ResetFilter href="/?bagian=ketersediaan" />}>
          <FilterGroup label="Komoditas">
            <FilterChips
              param="komoditas"
              label="Pilih komoditas ketersediaan"
              options={utama.map((item) => ({ value: item.nama, label: item.nama }))}
              selected={[namaAman]}
            />
          </FilterGroup>
          <FilterGroup
            label="Rentang data"
            hint={
              menampilkanProyeksi
                ? "Bagian proyeksi (Nov 2026–Des 2032) merupakan simulasi tren, bukan ramalan resmi."
                : "Riwayat memakai bulan riwayat terakhir, tanpa proyeksi."
            }
          >
            <FilterChips
              param="rentang"
              label="Rentang data ketersediaan"
              options={OPSI_RENTANG}
              selected={[rentang]}
            />
          </FilterGroup>
        </FilterBar>

        {menampilkanProyeksi ? (
          <div className="mt-4 flex items-start gap-3 rounded-card border border-primary-200 bg-primary-50 p-4">
            <ProjectionChip />
            <p className="text-sm leading-6 text-ink">
              Menampilkan <span className="font-semibold">{labelRentang}</span>. Status neraca
              terkini di atas tetap memakai bulan riwayat terakhir (
              {formatBulan(status.bulan)}), tidak termasuk proyeksi.
            </p>
          </div>
        ) : null}
      </Section>

      <Section
        title="Status pasokan"
        note="Aturan status: Surplus ≥ +5%, Defisit ≤ −5%, selain itu Seimbang."
      >
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12">
          <Card className="xl:col-span-5">
            <CardHeader
              title="Status Ketersediaan"
              description={`Bulan ${formatBulan(status.bulan)} · ${status.total} komoditas`}
            />
            <DonutChart data={donut} totalLabel="komoditas" />
            <ul className="mt-3 space-y-2" aria-label="Legenda status ketersediaan">
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
              Status dihitung dari rasio neraca bulan riwayat terbaru.
            </p>
          </Card>

          <Card className="xl:col-span-7">
            <CardHeader
              title="Status per Komoditas"
              description={`Bulan riwayat terbaru ${formatBulan(status.bulan)}`}
            />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {status.komoditas.map((item) => (
                <div
                  key={item.komoditas_id}
                  className="flex min-w-0 flex-col rounded-ctl border border-line p-3"
                >
                  <p className="font-semibold leading-5 text-ink">{item.nama}</p>
                  <div className="mt-2">
                    <StatusChip status={item.status_neraca} compact />
                  </div>
                  <p className="mt-2 text-sm leading-5 text-ink-muted">
                    Rasio neraca {formatPersen(item.rasio_neraca_persen)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {rows.length === 0 ? (
        <Section
          title="Pasokan dan kebutuhan"
          note={`Data ${namaAman} pada rentang ${labelRentang}.`}
        >
          <EmptyState actionHref="/?bagian=ketersediaan" />
        </Section>
      ) : (
        <Section
          title="Pasokan dan kebutuhan"
          note={`Per bulan, dalam ton. Rentang: ${labelRentang}.`}
        >
          <ChartCard
            title={`Pasokan vs Kebutuhan ${namaAman}`}
            description={`Per bulan, dalam ton. Rentang: ${labelRentang}.`}
            summary={`Grafik batang pasokan dan kebutuhan ${namaAman} per bulan dari ${formatBulan(rows[0]?.bulan)} sampai ${formatBulan(rows.at(-1)?.bulan)}.`}
            table={
              <DataTable
                kolom={kolomPasokan}
                baris={rows}
                kunci={(row) => row.bulan}
                caption={`Pasokan dan kebutuhan ${namaAman} per bulan`}
                minLebar={520}
              />
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
          </ChartCard>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-12">
            <ChartCard
              className="xl:col-span-8"
              title={`Stok Akhir ${namaAman}`}
              description={`Sisa stok pada akhir bulan, dalam ton. Rentang: ${labelRentang}.`}
              summary={`Grafik stok akhir ${namaAman} per bulan dari ${formatBulan(rows[0]?.bulan)} sampai ${formatBulan(rows.at(-1)?.bulan)}.`}
              table={
                <DataTable
                  kolom={kolomStok}
                  baris={rows}
                  kunci={(row) => row.bulan}
                  caption={`Stok akhir dan ketahanan stok ${namaAman} per bulan`}
                  minLebar={420}
                />
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
            </ChartCard>

            <Card className="flex flex-col xl:col-span-4">
              <CardHeader
                title={
                  menampilkanProyeksi && statusDipilih?.jenis_data === "proyeksi"
                    ? "Ringkasan Bulan Proyeksi"
                    : "Ringkasan Bulan Terbaru"
                }
                description={statusDipilih ? formatBulan(statusDipilih.bulan) : "–"}
                action={
                  statusDipilih?.jenis_data === "proyeksi" ? <ProjectionChip /> : null
                }
              />
              <dl className="space-y-4 text-base">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">Pasokan</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {statusDipilih ? formatTon(statusDipilih.pasokan_ton) : "–"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">Kebutuhan</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {statusDipilih ? formatTon(statusDipilih.kebutuhan_ton) : "–"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">Neraca</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {statusDipilih ? formatTon(statusDipilih.neraca_ton) : "–"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">Ketahanan stok</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {statusDipilih ? formatHari(statusDipilih.ketahanan_stok_hari) : "–"}
                  </dd>
                </div>
              </dl>
              <p className="mt-auto border-t border-line pt-3 text-sm leading-5 text-ink-muted">
                Simulasi pasokan–kebutuhan, bukan data resmi.
              </p>
            </Card>
          </div>
        </Section>
      )}

      <PageFooter note={<>Sumber harga: {info.sumber}. Data ketersediaan adalah simulasi (dummy), bukan data resmi.</>} />
    </>
  );
}
