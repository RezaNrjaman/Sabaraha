export function ambilDaftar(
  value: string | string[] | undefined,
  fallback: string[],
): string[] {
  if (Array.isArray(value)) return value.length > 0 ? value : fallback;
  if (typeof value === "string" && value.length > 0) return [value];
  return fallback;
}

export function ambilAngka(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const teks = Array.isArray(value) ? value[0] : value;
  const angka = Number(teks);
  return Number.isFinite(angka) ? angka : fallback;
}

export function ringkasTanggal(dari: string, sampai: string): string {
  return `${dari} – ${sampai}`;
}
