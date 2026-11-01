export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly string[];

export function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== "") search.append(key, item);
      }
      continue;
    }
    search.set(key, String(value));
  }
  const hasil = search.toString();
  return hasil ? `?${hasil}` : "";
}

export function denganQuery(path: string, params: Record<string, QueryValue>): string {
  return `${path}${buildQuery(params)}`;
}

export function hariSebelum(tanggal: string, hari: number): string {
  const date = new Date(`${tanggal}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - hari);
  return date.toISOString().slice(0, 10);
}

export function bulanSebelum(tanggal: string, bulan: number): string {
  const date = new Date(`${tanggal}T00:00:00Z`);
  const hari = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - bulan);
  const hariTerakhir = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(hari, hariTerakhir));
  return date.toISOString().slice(0, 10);
}

export function rentangHari(tanggalAkhir: string, hari: number) {
  return { dari: hariSebelum(tanggalAkhir, hari), sampai: tanggalAkhir };
}

export function pilihanParam(
  value: string | string[] | undefined,
  fallback: string,
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value || fallback;
}
