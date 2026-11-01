import { describe, expect, it } from "vitest";

import {
  bandsPeriode,
  buildAverageIndex,
  buildIndexComparison,
  findSpikes,
  monthlyAverageByYear,
  pivotHarga,
} from "@/lib/data";
import type { HargaPoint, Periode } from "@/lib/types";

const rows: HargaPoint[] = [
  { komoditas_id: 1, nama: "Beras", satuan: "kg", tanggal: "2026-01-01", harga: 100 },
  { komoditas_id: 1, nama: "Beras", satuan: "kg", tanggal: "2026-02-01", harga: 110 },
  { komoditas_id: 2, nama: "Cabai", satuan: "kg", tanggal: "2026-01-01", harga: 200 },
  { komoditas_id: 2, nama: "Cabai", satuan: "kg", tanggal: "2026-02-01", harga: 180 },
];

describe("transformasi data", () => {
  it("memutar baris harga menjadi kolom per komoditas", () => {
    expect(pivotHarga(rows)).toEqual([
      { tanggal: "2026-01-01", Beras: 100, Cabai: 200 },
      { tanggal: "2026-02-01", Beras: 110, Cabai: 180 },
    ]);
  });

  it("membuat indeks awal 100 per komoditas", () => {
    expect(buildIndexComparison(rows)).toEqual([
      { tanggal: "2026-01-01", Beras: 100, Cabai: 100 },
      { tanggal: "2026-02-01", Beras: 110, Cabai: 90 },
    ]);
  });

  it("membuat indeks rata-rata dari beberapa komoditas", () => {
    const hasil = buildAverageIndex(rows);
    expect(hasil[0]).toEqual({ tanggal: "2026-01-01", indeks: 100, jumlah: 2 });
    expect(hasil[1].indeks).toBe(100);
    expect(hasil[1].jumlah).toBe(2);
  });

  it("menghitung rata-rata bulanan per tahun", () => {
    const { data, tahun } = monthlyAverageByYear(rows, "Beras");
    expect(tahun).toEqual(["2026"]);
    expect(data[0].bulan).toBe("Jan");
    expect(data[0]["2026"]).toBe(100);
    expect(data[1]["2026"]).toBe(110);
  });

  it("menempelkan pita periode ke tanggal data terdekat", () => {
    const periods: Periode[] = [
      {
        id: 1,
        nama: "Ramadan",
        tanggal_mulai: "2026-01-15",
        tanggal_selesai: "2026-02-15",
        is_perkiraan: false,
        status_verifikasi: "terverifikasi",
      },
    ];

    const hasil = bandsPeriode(
      periods,
      "2026-01-01",
      "2026-03-01",
      ["2026-01-01", "2026-02-01", "2026-03-01"],
    );

    expect(hasil).toHaveLength(1);
    expect(hasil[0].tanggal_mulai).toBe("2026-02-01");
    expect(hasil[0].tanggal_selesai).toBe("2026-02-01");
  });

  it("menandai lonjakan di luar dua simpangan baku", () => {
    const hasil = findSpikes(
      [
        ...rows.filter((row) => row.nama === "Beras"),
        { komoditas_id: 1, nama: "Beras", satuan: "kg", tanggal: "2026-03-01", harga: 102 },
        { komoditas_id: 1, nama: "Beras", satuan: "kg", tanggal: "2026-04-01", harga: 104 },
        { komoditas_id: 1, nama: "Beras", satuan: "kg", tanggal: "2026-05-01", harga: 106 },
        { komoditas_id: 1, nama: "Beras", satuan: "kg", tanggal: "2026-06-01", harga: 108 },
        { komoditas_id: 1, nama: "Beras", satuan: "kg", tanggal: "2026-07-01", harga: 1000 },
      ],
      "Beras",
    );
    expect(hasil.at(-1)?.lonjakan).toBe(true);
  });
});
