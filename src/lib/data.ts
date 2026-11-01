import { namaBulan } from "./format";
import type { HargaPoint, Periode } from "./types";

export type PivotRow = { tanggal: string } & Record<string, number | string>;

export function pivotHarga(rows: HargaPoint[]): PivotRow[] {
  const map = new Map<string, PivotRow>();
  for (const row of rows) {
    let entry = map.get(row.tanggal);
    if (!entry) {
      entry = { tanggal: row.tanggal };
      map.set(row.tanggal, entry);
    }
    entry[row.nama] = row.harga;
  }
  return [...map.values()].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
}

export function daftarKomoditasDariHarga(rows: HargaPoint[]): string[] {
  return [...new Set(rows.map((row) => row.nama))];
}

export function buildIndexComparison(rows: HargaPoint[]): PivotRow[] {
  const awal = new Map<string, number>();
  for (const row of rows) {
    if (!awal.has(row.nama) && row.harga > 0) awal.set(row.nama, row.harga);
  }

  const map = new Map<string, PivotRow>();
  for (const row of rows) {
    const basis = awal.get(row.nama);
    if (!basis) continue;
    let entry = map.get(row.tanggal);
    if (!entry) {
      entry = { tanggal: row.tanggal };
      map.set(row.tanggal, entry);
    }
    entry[row.nama] = Number(((row.harga / basis) * 100).toFixed(2));
  }
  return [...map.values()].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
}

export interface IndeksPoint {
  tanggal: string;
  indeks: number;
  jumlah: number;
  [key: string]: string | number | null;
}

export function buildAverageIndex(rows: HargaPoint[]): IndeksPoint[] {
  const awal = new Map<string, number>();
  for (const row of rows) {
    if (!awal.has(row.nama) && row.harga > 0) awal.set(row.nama, row.harga);
  }

  const buckets = new Map<string, number[]>();
  for (const row of rows) {
    const basis = awal.get(row.nama);
    if (!basis) continue;
    const nilai = (row.harga / basis) * 100;
    const list = buckets.get(row.tanggal) ?? [];
    list.push(nilai);
    buckets.set(row.tanggal, list);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tanggal, values]) => ({
      tanggal,
      indeks: Number(
        (values.reduce((total, value) => total + value, 0) / values.length).toFixed(2),
      ),
      jumlah: values.length,
    }));
}

export interface BulanTahunan {
  bulan: string;
  [tahun: string]: string | number | null;
}

export function monthlyAverageByYear(
  rows: HargaPoint[],
  nama: string,
): { data: BulanTahunan[]; tahun: string[] } {
  const buckets = new Map<string, { total: number; jumlah: number }>();
  const setTahun = new Set<number>();

  for (const row of rows) {
    if (row.nama !== nama) continue;
    const tanggal = new Date(`${row.tanggal}T00:00:00Z`);
    const tahun = tanggal.getUTCFullYear();
    const bulan = tanggal.getUTCMonth();
    const key = `${tahun}-${bulan}`;
    const bucket = buckets.get(key) ?? { total: 0, jumlah: 0 };
    bucket.total += row.harga;
    bucket.jumlah += 1;
    buckets.set(key, bucket);
    setTahun.add(tahun);
  }

  const tahun = [...setTahun].sort((a, b) => a - b).map(String);
  const data: BulanTahunan[] = Array.from({ length: 12 }, (_, index) => ({
    bulan: namaBulan(index),
  }));

  for (const [key, bucket] of buckets) {
    const [tahunKey, bulanKey] = key.split("-");
    const index = Number(bulanKey);
    data[index][tahunKey] = Number((bucket.total / bucket.jumlah).toFixed(2));
  }

  return { data, tahun };
}

export interface SpikePoint extends HargaPoint {
  lonjakan: boolean;
  batasAtas: number;
  batasBawah: number;
}

export function findSpikes(rows: HargaPoint[], nama?: string): SpikePoint[] {
  const filtered = nama ? rows.filter((row) => row.nama === nama) : rows;
  if (filtered.length === 0) return [];

  const values = filtered.map((row) => row.harga);
  const rataRata = values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.length > 1
      ? values.reduce((total, value) => total + (value - rataRata) ** 2, 0) /
        (values.length - 1)
      : 0;
  const simpangan = Math.sqrt(variance);
  const batasAtas = rataRata + 2 * simpangan;
  const batasBawah = rataRata - 2 * simpangan;

  return filtered
    .map((row) => ({
      ...row,
      lonjakan: row.harga > batasAtas || row.harga < batasBawah,
      batasAtas: Number(batasAtas.toFixed(2)),
      batasBawah: Number(batasBawah.toFixed(2)),
    }))
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
}

export function bandsPeriode(
  periods: Periode[],
  dari: string,
  sampai: string,
  tanggalData: string[] = [],
): Periode[] {
  const tanggal = [...new Set(tanggalData)].sort();

  return periods
    .filter(
      (periode) =>
        periode.tanggal_selesai >= dari && periode.tanggal_mulai <= sampai,
    )
    .map((periode) => {
      if (tanggal.length === 0) return periode;

      const mulai = tanggal.find((item) => item >= periode.tanggal_mulai);
      const selesai = [...tanggal]
        .reverse()
        .find((item) => item <= periode.tanggal_selesai);

      if (!mulai || !selesai || mulai > selesai) return null;

      return {
        ...periode,
        tanggal_mulai: mulai,
        tanggal_selesai: selesai,
      };
    })
    .filter((periode): periode is Periode => periode !== null);
}

export function ringkasAngka(values: number[]) {
  if (values.length === 0) {
    return { rataRata: null, tertinggi: null, terendah: null };
  }
  return {
    rataRata: values.reduce((total, value) => total + value, 0) / values.length,
    tertinggi: Math.max(...values),
    terendah: Math.min(...values),
  };
}
