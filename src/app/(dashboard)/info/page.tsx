import Link from "next/link";
import type { ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Database,
  ExternalLink,
  HeartPulse,
  Info,
  Layers,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import { Card, CardHeader } from "@/components/ui/card";
import { Chip } from "@/components/ui/status-chip";
import { PageHeader } from "@/components/ui/page-header";
import { fetchApiData, fetchApiEnvelope } from "@/lib/api";
import { formatTanggal, formatWaktu } from "@/lib/format";
import type { HealthData, InfoData } from "@/lib/types";

export const metadata = {
  title: "Info Data",
};

function BarisInfo({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-1 border-b border-line/80 py-3 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

export default async function InfoPage() {
  const envelope = await fetchApiEnvelope<InfoData>("/info");
  const info = envelope.data;
  const health = await fetchApiData<HealthData>("/health");
  const sehat = health.status === "ok" && health.basis_data === "terhubung";

  return (
    <>
      <PageHeader
        eyebrow="Transparansi data"
        title="Info Data"
        description="Sumber, cakupan, metode, dan keterbatasan data yang dipakai dashboard Sabaraha."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader
            title="Ringkasan Data"
            description="Informasi yang dikirim langsung oleh layanan data."
          />
          <dl>
            <BarisInfo label="Sumber harga" value={info.sumber} />
            <BarisInfo
              label="Periode data"
              value={`${formatTanggal(info.periode_data.dari)} – ${formatTanggal(info.periode_data.sampai)}`}
            />
            <BarisInfo
              label="Tanggal data terakhir"
              value={formatTanggal(info.tanggal_data_terakhir)}
            />
            <BarisInfo label="Data diperbarui terakhir" value={formatWaktu(envelope.meta.diperbarui_pada)} />
            <BarisInfo label="Satuan harga" value={info.satuan_harga} />
            <BarisInfo
              label="Label ketersediaan"
              value={<Chip tone="netral">{info.label_ketersediaan}</Chip>}
            />
          </dl>
          <p className="mt-4 border-t border-line pt-3 text-sm leading-5 text-ink-muted">
            Harga mengikuti pasar tradisional dalam unduhan PIHPS Nasional. Nilai kosong pada
            sumber disimpan sebagai NULL dan ditampilkan sebagai “-”, bukan nol.
          </p>
        </Card>

        <div className="space-y-6 xl:col-span-5">
          <Card>
            <CardHeader
              title="Status Layanan"
              description="Pemeriksaan langsung ke layanan data."
            />
            <div className="flex flex-wrap items-center gap-2">
              <Chip
                tone={sehat ? "turun" : "naik"}
                icon={
                  sehat ? <CheckCircle2 size={14} /> : <TriangleAlert size={14} />
                }
              >
                {sehat ? "Layanan data aktif" : "Layanan data bermasalah"}
              </Chip>
              <Chip tone="netral" icon={<Database size={14} />}>
                Basis data: {health.basis_data}
              </Chip>
            </div>
            <div className="mt-4 flex items-start gap-2 text-sm text-ink-muted">
              <RefreshCw size={15} className="mt-0.5 shrink-0" />
              <p>Dicek pada {formatWaktu(health.waktu)} WIB.</p>
            </div>
            <div className="mt-4 border-t border-line pt-4 text-sm">
              <a
                href="https://www.bi.go.id/hargapangan"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-primary-700 underline-offset-2 hover:underline"
              >
                Sumber PIHPS <ExternalLink size={14} />
              </a>
            </div>
          </Card>

          <Card>
            <CardHeader title="Cakupan" />
            <div className="space-y-3 text-sm leading-6 text-ink-muted">
              <p className="flex gap-2">
                <Layers size={16} className="mt-0.5 shrink-0 text-primary-600" />
                Harga harian untuk 31 komoditas; dashboard utama menampilkan 10 komoditas
                utama.
              </p>
              <p className="flex gap-2">
                <CalendarDays size={16} className="mt-0.5 shrink-0 text-primary-600" />
                Data hanya tersedia pada hari kerja. Akhir pekan dan hari libur tidak
                memiliki baris harga.
              </p>
              <p className="flex gap-2">
                <HeartPulse size={16} className="mt-0.5 shrink-0 text-primary-600" />
                Ketersediaan dan prediksi adalah lapisan analisis, bukan data resmi pasar.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <CardHeader
            title="Keterbatasan Data"
            description="Daftar ini berasal dari catatan keterbatasan layanan data."
          />
          <ol className="space-y-3">
            {info.keterbatasan.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-ink-muted">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                  {index + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
          <div className="mt-5 flex items-start gap-2 rounded-ctl border border-line bg-bg px-3 py-2 text-sm text-ink-muted">
            <Info size={16} className="mt-0.5 shrink-0" />
            <p>
              Dashboard ini hanya-baca dan tidak memberi rekomendasi jual-beli. Gunakan
              sebagai alat eksplorasi, bukan dasar keputusan tunggal.
            </p>
          </div>
        </Card>

        <div className="space-y-6 xl:col-span-5">
          <Card>
            <CardHeader title="Tentang Ketersediaan" />
            <p className="text-sm leading-6 text-ink-muted">
              Data ketersediaan dibuat untuk keperluan simulasi tugas perkuliahan dan bukan
              data resmi pasokan Kota Bandung.
            </p>
            <p className="mt-4 border-t border-line pt-3 text-sm leading-6 text-ink-muted">
              Ambang status: Surplus bila rasio neraca ≥ +5%, Defisit bila ≤ −5%, dan
              Seimbang di antaranya. Data disajikan per bulan dan per komoditas.
            </p>
          </Card>

          <Card>
            <CardHeader title="Metode Prediksi" />
            <p className="flex gap-2 text-sm leading-6 text-ink-muted">
              <BookOpen size={16} className="mt-0.5 shrink-0 text-primary-600" />
              Prediksi memakai median persen perubahan harga pada kejadian historis periode
              yang sama. Pembandingnya adalah harga rata-rata 30 hari sebelum periode, dengan
              minimal 15 titik data.
            </p>
            <p className="mt-3 flex gap-2 text-sm leading-6 text-ink-muted">
              <Info size={16} className="mt-0.5 shrink-0 text-primary-600" />
              Jumlah kejadian per periode sekitar 5–6. Rentang min–maks ditampilkan agar
              ketidakpastian tidak tersembunyi.
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            istilah: "NULL",
            arti: "Harga tidak tersedia pada sumber. Tidak diubah menjadi Rp 0.",
          },
          {
            istilah: "Median",
            arti: "Nilai tengah setelah data diurutkan; lebih tahan terhadap nilai ekstrem.",
          },
          {
            istilah: "Koefisien variasi",
            arti: "Simpangan baku ÷ rata-rata × 100. Mengukur gejolak relatif.",
          },
          {
            istilah: "Surplus",
            arti: "Neraca dengan rasio pasokan-kebutuhan ≥ +5%.",
          },
        ].map((item) => (
          <Card key={item.istilah} className="p-4 sm:p-5">
            <p className="text-sm font-semibold text-primary-700">{item.istilah}</p>
            <p className="mt-1 text-sm leading-5 text-ink-muted">{item.arti}</p>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-sm leading-5 text-ink-muted">
        Sumber harga: {info.sumber}. Data terakhir: {formatTanggal(info.tanggal_data_terakhir)}.
        Halaman ini tidak memuat kunci akses atau kredensial basis data. Ingin kembali ke
        dashboard? <Link href="/" className="font-medium text-primary-700 underline-offset-2 hover:underline">Buka Dashboard</Link>.
      </p>
    </>
  );
}
