import type { HargaPoint, Periode } from "./types";

/**
 * Uji mundur (backtest) prediksi periode.
 *
 * Rumusnya sengaja dibuat sama dengan pengolahan data backend:
 *   persen = (rata-rata harga saat periode − rata-rata harga 30 hari kalender
 *            sebelum periode) ÷ rata-rata baseline × 100
 * dengan baseline minimal 15 titik data. Karena API tidak menyiapkan
 * endpoint backtest, perhitungan dilakukan di halaman ini memakai /periode
 * (tanggal kejadian) dan /harga harian.
 *
 * Prediksi tiap kejadian memakai median kejadian lain pada periode yang sama
 * (leave-one-out), supaya kejadian yang sedang diuji tidak ikut melatih
 * prediksinya sendiri.
 */

const HARI_MS = 86_400_000;
const HARI_BASELINE = 30;
const MIN_BASELINE = 15;

export interface BarisBacktest {
  tahun: number;
  tanggal_mulai: string;
  prediksi: number;
  rentangMin: number;
  rentangMaks: number;
  aktual: number;
  selisih: number;
  dalamRentang: boolean;
}

export interface RingkasanBacktest {
  rataMeleset: number;
  jumlah: number;
  dalamRentang: number;
}

function keMs(tanggal: string): number {
  return Date.parse(`${tanggal}T00:00:00Z`);
}

function keIso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function bulat2(nilai: number): number {
  return Math.round(nilai * 100) / 100;
}

function rataRata(nilai: number[]): number {
  return nilai.reduce((total, n) => total + n, 0) / nilai.length;
}

function median(nilai: number[]): number {
  const urut = [...nilai].sort((a, b) => a - b);
  const tengah = Math.floor(urut.length / 2);
  return urut.length % 2 === 1
    ? urut[tengah]!
    : (urut[tengah - 1]! + urut[tengah]!) / 2;
}

/**
 * Persen kenaikan satu kejadian periode. Mengembalikan null bila baseline
 * kurang dari 15 titik, baseline nol, atau tidak ada harga saat periode.
 */
export function persenKejadian(
  harga: HargaPoint[],
  peristiwa: Periode,
): number | null {
  const peta = new Map<string, number>();
  for (const titik of harga) {
    if (typeof titik.harga === "number" && Number.isFinite(titik.harga)) {
      peta.set(titik.tanggal, titik.harga);
    }
  }
  const mulai = keMs(peristiwa.tanggal_mulai);
  const selesai = keMs(peristiwa.tanggal_selesai);

  const baseline: number[] = [];
  for (let t = mulai - HARI_BASELINE * HARI_MS; t <= mulai - HARI_MS; t += HARI_MS) {
    const nilai = peta.get(keIso(t));
    if (nilai !== undefined) baseline.push(nilai);
  }
  if (baseline.length < MIN_BASELINE) return null;
  const rataBaseline = rataRata(baseline);
  if (rataBaseline === 0) return null;

  const saatPeriode: number[] = [];
  for (let t = mulai; t <= selesai; t += HARI_MS) {
    const nilai = peta.get(keIso(t));
    if (nilai !== undefined) saatPeriode.push(nilai);
  }
  if (saatPeriode.length === 0) return null;

  return bulat2(((rataRata(saatPeriode) - rataBaseline) / rataBaseline) * 100);
}

/**
 * Uji mundur per kejadian untuk satu komoditas dan satu periode.
 * Mengembalikan array kosong bila kejadian kurang dari dua.
 */
export function hitungBacktest(
  harga: HargaPoint[],
  daftarPeriode: Periode[],
  namaKomoditas: string,
  namaPeriode: string,
): BarisBacktest[] {
  const seri = harga.filter((titik) => titik.nama === namaKomoditas);
  const kejadian = daftarPeriode
    .filter((peristiwa) => peristiwa.nama === namaPeriode && !peristiwa.is_perkiraan)
    .map((peristiwa) => ({ peristiwa, persen: persenKejadian(seri, peristiwa) }))
    .filter(
      (hasil): hasil is { peristiwa: Periode; persen: number } => hasil.persen !== null,
    )
    .sort((a, b) => a.peristiwa.tanggal_mulai.localeCompare(b.peristiwa.tanggal_mulai));

  if (kejadian.length < 2) return [];

  return kejadian.map((diri, index) => {
    const lain = kejadian
      .filter((_, i) => i !== index)
      .map((hasil) => hasil.persen);
    const prediksi = bulat2(median(lain));
    const minimum = Math.min(...lain);
    const maksimum = Math.max(...lain);
    return {
      tahun: Number(diri.peristiwa.tanggal_mulai.slice(0, 4)),
      tanggal_mulai: diri.peristiwa.tanggal_mulai,
      prediksi,
      rentangMin: bulat2(minimum),
      rentangMaks: bulat2(maksimum),
      aktual: diri.persen,
      selisih: bulat2(diri.persen - prediksi),
      dalamRentang: diri.persen >= minimum && diri.persen <= maksimum,
    };
  });
}

export function ringkasBacktest(baris: BarisBacktest[]): RingkasanBacktest | null {
  if (baris.length === 0) return null;
  const meleset =
    baris.reduce((total, baris) => total + Math.abs(baris.selisih), 0) / baris.length;
  return {
    rataMeleset: bulat2(meleset),
    jumlah: baris.length,
    dalamRentang: baris.filter((baris) => baris.dalamRentang).length,
  };
}
