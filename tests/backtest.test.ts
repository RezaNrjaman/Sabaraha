import { describe, expect, it } from "vitest";

import { hitungBacktest, persenKejadian, ringkasBacktest } from "@/lib/backtest";
import type { HargaPoint, Periode } from "@/lib/types";

const HARI_MS = 86_400_000;

function iso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function seriHari(dari: string, sampai: string, harga: number): HargaPoint[] {
  const hasil: HargaPoint[] = [];
  let ms = Date.parse(`${dari}T00:00:00Z`);
  const akhir = Date.parse(`${sampai}T00:00:00Z`);
  while (ms <= akhir) {
    hasil.push({ komoditas_id: 1, nama: "Beras", satuan: "kg", tanggal: iso(ms), harga });
    ms += HARI_MS;
  }
  return hasil;
}

/**
 * Tiga kejadian dengan kenaikan 10%, 20%, dan 30% terhadap baseline 100.
 * Baseline tiap kejadian 30 hari kalender sebelum periode (30 titik).
 */
function hargaUji(): HargaPoint[] {
  return [
    ...seriHari("2022-12-02", "2022-12-31", 100),
    ...seriHari("2023-01-01", "2023-01-10", 110),
    ...seriHari("2023-12-02", "2023-12-31", 100),
    ...seriHari("2024-01-01", "2024-01-10", 120),
    ...seriHari("2024-12-02", "2024-12-31", 100),
    ...seriHari("2025-01-01", "2025-01-10", 130),
  ];
}

function periodeUji(): Periode[] {
  const buat = (id: number, tahun: number, perkiraan: boolean): Periode => ({
    id,
    nama: "Uji",
    tanggal_mulai: `${tahun}-01-01`,
    tanggal_selesai: `${tahun}-01-10`,
    is_perkiraan: perkiraan,
    status_verifikasi: "draf_perlu_verifikasi",
  });
  return [
    buat(1, 2023, false),
    buat(2, 2024, false),
    buat(3, 2025, false),
    // Periode mendatang berbasis perkiraan tidak ikut diuji.
    buat(4, 2026, true),
  ];
}

describe("persenKejadian", () => {
  it("menghitung kenaikan terhadap rata-rata 30 hari sebelum periode", () => {
    expect(persenKejadian(hargaUji(), periodeUji()[0]!)).toBe(10);
    expect(persenKejadian(hargaUji(), periodeUji()[1]!)).toBe(20);
    expect(persenKejadian(hargaUji(), periodeUji()[2]!)).toBe(30);
  });

  it("mengembalikan null bila baseline kurang dari 15 titik", () => {
    const periode: Periode = {
      id: 9,
      nama: "Uji",
      tanggal_mulai: "2020-01-01",
      tanggal_selesai: "2020-01-10",
      is_perkiraan: false,
      status_verifikasi: "draf_perlu_verifikasi",
    };
    // Harga hanya tersedia saat periode, tanpa 30 hari sebelumnya.
    const harga = seriHari("2020-01-01", "2020-01-10", 100);
    expect(persenKejadian(harga, periode)).toBeNull();
  });
});

describe("hitungBacktest", () => {
  it("memakai median kejadian lain sebagai prediksi tiap kejadian", () => {
    const hasil = hitungBacktest(hargaUji(), periodeUji(), "Beras", "Uji");

    expect(hasil.map((baris) => baris.tahun)).toEqual([2023, 2024, 2025]);
    expect(hasil.map((baris) => baris.aktual)).toEqual([10, 20, 30]);
    expect(hasil.map((baris) => baris.prediksi)).toEqual([25, 20, 15]);
    expect(hasil.map((baris) => baris.selisih)).toEqual([-15, 0, 15]);
    expect(hasil.map((baris) => baris.dalamRentang)).toEqual([false, true, false]);
  });

  it("mengabaikan periode perkiraan dan komoditas lain", () => {
    const lain = hargaUji().map((titik) => ({ ...titik, nama: "Cabai" }));
    const hasil = hitungBacktest([...hargaUji(), ...lain], periodeUji(), "Beras", "Uji");

    expect(hasil).toHaveLength(3);
    expect(hasil.every((baris) => baris.tahun < 2026)).toBe(true);
  });

  it("mengembalikan kosong bila kejadian kurang dari dua", () => {
    const satu = [periodeUji()[0]!];
    expect(hitungBacktest(hargaUji(), satu, "Beras", "Uji")).toEqual([]);
    expect(hitungBacktest(hargaUji(), periodeUji(), "Beras", "Tanpa-Sama")).toEqual([]);
  });
});

describe("ringkasBacktest", () => {
  it("menjumlah rata-rata selisih dan banyaknya kejadian dalam rentang", () => {
    const hasil = ringkasBacktest(hitungBacktest(hargaUji(), periodeUji(), "Beras", "Uji"));

    expect(hasil).toEqual({ rataMeleset: 10, jumlah: 3, dalamRentang: 1 });
  });

  it("mengembalikan null bila tidak ada baris", () => {
    expect(ringkasBacktest([])).toBeNull();
  });
});
