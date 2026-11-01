const BULAN_PENDEK = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const tanggalPendekFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function keTanggalUtc(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const tanggal = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(tanggal.getTime()) ? null : tanggal;
}

export function formatRupiah(
  value: number | null | undefined,
  satuan?: string | null,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const angka = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
  return satuan ? `Rp ${angka}/${satuan}` : `Rp ${angka}`;
}

export function formatCompactRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const absolut = Math.abs(value);
  if (absolut >= 1_000_000_000) {
    return `Rp ${formatAngka(value / 1_000_000_000, 1)} M`;
  }
  if (absolut >= 1_000_000) {
    return `Rp ${formatAngka(value / 1_000_000, 1)} jt`;
  }
  if (absolut >= 1_000) {
    return `Rp ${formatAngka(value / 1_000, 0)} rb`;
  }
  return `Rp ${formatAngka(value, 0)}`;
}

export function formatAngka(
  value: number | null | undefined,
  maksDesimal = 1,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: maksDesimal,
  }).format(value);
}

export function formatPersen(
  value: number | null | undefined,
  maksDesimal = 1,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: maksDesimal,
  }).format(value)}%`;
}

export function formatPersenBertanda(
  value: number | null | undefined,
  maksDesimal = 1,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const angka = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: maksDesimal,
    signDisplay: "exceptZero",
  }).format(value);
  return `${angka}%`;
}

export function formatTanggal(value: string | null | undefined): string {
  if (!value) return "-";
  const tanggal = keTanggalUtc(value);
  return tanggal ? tanggalFormatter.format(tanggal) : "-";
}

export function formatTanggalPendek(value: string | null | undefined): string {
  if (!value) return "-";
  const tanggal = keTanggalUtc(value);
  return tanggal ? tanggalPendekFormatter.format(tanggal) : "-";
}

export function formatWaktu(value: string | null | undefined): string {
  if (!value) return "-";
  const tanggal = new Date(value);
  if (Number.isNaN(tanggal.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(tanggal);
}

export function formatBulan(value: string | null | undefined): string {
  if (!value) return "-";
  const tanggal = keTanggalUtc(value);
  if (!tanggal) return "-";
  return `${BULAN_PENDEK[tanggal.getUTCMonth()]} ${tanggal.getUTCFullYear()}`;
}

export function namaBulan(value: number): string {
  return BULAN_PENDEK[value] ?? "-";
}

export function formatTon(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${formatAngka(value, 1)} ton`;
}

export function formatHari(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${formatAngka(value, 1)} hari`;
}

export function statusHarga(persen: number | null | undefined): "Naik" | "Turun" | "Stabil" {
  if (persen === null || persen === undefined || Number.isNaN(persen)) return "Stabil";
  if (Math.abs(persen) < 1) return "Stabil";
  return persen > 0 ? "Naik" : "Turun";
}

export function statusNeraca(persen: number): "Surplus" | "Seimbang" | "Defisit" {
  if (persen >= 5) return "Surplus";
  if (persen <= -5) return "Defisit";
  return "Seimbang";
}
