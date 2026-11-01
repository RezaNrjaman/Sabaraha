export type HargaStatus = "Naik" | "Turun" | "Stabil";
export type NeracaStatus = "Surplus" | "Seimbang" | "Defisit";
export type Agregasi = "harian" | "mingguan" | "bulanan";
export type Arah = "naik" | "turun";

export interface Meta {
  sumber: string;
  tanggal_data_terakhir: string | null;
  diperbarui_pada: string | null;
  dibuat_pada: string;
  [key: string]: unknown;
}

export interface Envelope<T> {
  data: T;
  meta: Meta;
}

export interface InfoData {
  sumber: string;
  tanggal_data_terakhir: string;
  periode_data: { dari: string; sampai: string };
  satuan_harga: string;
  keterbatasan: string[];
  label_ketersediaan: string;
}

export interface HealthData {
  status: string;
  basis_data: string;
  waktu: string;
}

export interface Komoditas {
  id: number;
  nama: string;
  satuan: string;
  induk_id: number | null;
  is_utama: boolean;
}

export interface RingkasanData {
  indeks_harga_pangan: {
    nilai: number;
    awal_periode: number;
    jumlah_komoditas: number;
    periode: { dari: string; sampai: string };
  };
  komoditas_naik_30_hari: { jumlah: number; dari: number };
  komoditas_defisit_bulan_terbaru: {
    jumlah: number;
    bulan: string;
    total_komoditas: number;
    is_dummy: boolean;
    catatan: string;
  };
  prediksi_periode_berikutnya: {
    periode_nama: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    is_perkiraan: boolean;
    median_persen: number;
    min_persen: number;
    maks_persen: number;
    jumlah_komoditas: number;
  };
}

export interface HargaPoint {
  komoditas_id: number;
  nama: string;
  satuan: string;
  tanggal: string;
  harga: number;
}

export interface HargaTerkini {
  komoditas_id: number;
  nama: string;
  satuan: string;
  tanggal_terkini: string;
  harga_terkini: number | null;
  perubahan: {
    satu_hari: number | null;
    tujuh_hari: number | null;
    tiga_puluh_hari: number | null;
  };
  status: HargaStatus;
  grafik_mini: Array<{ tanggal: string; harga: number }>;
}

export interface Peringkat {
  komoditas_id: number;
  nama: string;
  satuan: string;
  harga_awal: number;
  harga_akhir: number;
  persen: number;
  tanggal_awal: string;
  tanggal_akhir: string;
}

export interface Volatilitas {
  komoditas_id: number;
  nama: string;
  satuan: string;
  rata_rata: number;
  simpangan_baku: number;
  koefisien_variasi_persen: number;
  jumlah_titik: number;
}

export interface Periode {
  id: number;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  is_perkiraan: boolean;
  status_verifikasi: string;
}

export interface StatistikPeriode {
  komoditas_id: number;
  nama: string;
  satuan: string;
  periode_nama: string;
  jumlah_kejadian: number;
  rata_rata_persen: number;
  median_persen: number;
  min_persen: number;
  maks_persen: number;
}

export interface Ketersediaan {
  bulan: string;
  komoditas_id: number;
  nama: string;
  pasokan_ton: number;
  kebutuhan_ton: number;
  neraca_ton: number;
  rasio_neraca_persen: number;
  stok_akhir_ton: number;
  ketahanan_stok_hari: number;
  status_neraca: NeracaStatus;
  is_dummy: boolean;
}

export interface StatusKetersediaan {
  bulan: string;
  jumlah: { surplus: number; seimbang: number; defisit: number };
  total: number;
  komoditas: Array<{
    komoditas_id: number;
    nama: string;
    status_neraca: NeracaStatus;
    rasio_neraca_persen: number;
  }>;
  is_dummy: boolean;
  catatan: string;
}

export interface PrediksiData {
  komoditas: { id: number; nama: string; satuan: string };
  periode_nama: string;
  median_persen: number;
  rata_rata_persen: number;
  min_persen: number;
  maks_persen: number;
  jumlah_kejadian: number;
  tanggal_perkiraan: string;
  is_perkiraan: boolean;
  rentang: { min: number; maks: number };
  catatan: string;
  metode: string;
}

export interface ApiErrorBody {
  galat: { kode: string; pesan: string };
}
