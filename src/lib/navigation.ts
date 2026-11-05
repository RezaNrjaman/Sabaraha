import {
  Activity,
  CalendarDays,
  Info,
  LayoutDashboard,
  LineChart,
  Package,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
}

/** Menu utama: hanya Dashboard dan Info Data. */
export const navItems: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    shortLabel: "Dashboard",
    description: "Ringkasan, tren, periode, volatilitas, ketersediaan, dan prediksi",
    icon: LayoutDashboard,
  },
  {
    href: "/info",
    label: "Info Data",
    shortLabel: "Info",
    description: "Sumber, metode, dan keterbatasan data",
    icon: Info,
  },
];

export type KunciBagian =
  | "ringkasan"
  | "tren"
  | "periode"
  | "volatilitas"
  | "ketersediaan"
  | "prediksi";

export const URUTAN_BAGIAN: KunciBagian[] = [
  "ringkasan",
  "tren",
  "periode",
  "volatilitas",
  "ketersediaan",
  "prediksi",
];

export interface BagianItem {
  kunci: KunciBagian;
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Enam bagian dashboard, ditampilkan sebagai tab di satu halaman `/`. */
export const bagianItems: BagianItem[] = [
  { kunci: "ringkasan", label: "Ringkasan", href: "/", icon: LayoutDashboard },
  { kunci: "tren", label: "Tren Harga", href: "/?bagian=tren", icon: LineChart },
  { kunci: "periode", label: "Periode", href: "/?bagian=periode", icon: CalendarDays },
  { kunci: "volatilitas", label: "Volatilitas", href: "/?bagian=volatilitas", icon: Activity },
  { kunci: "ketersediaan", label: "Ketersediaan", href: "/?bagian=ketersediaan", icon: Package },
  { kunci: "prediksi", label: "Prediksi", href: "/?bagian=prediksi", icon: TrendingUp },
];

export const JUDUL_BAGIAN: Record<KunciBagian, string> = {
  ringkasan: "Dashboard",
  tren: "Tren Harga",
  periode: "Periode & Musiman",
  volatilitas: "Volatilitas",
  ketersediaan: "Ketersediaan",
  prediksi: "Prediksi",
};

/** Nilai `?bagian=` yang tidak dikenal jatuh ke Ringkasan. */
export function normalisasiBagian(
  nilai: string | string[] | undefined,
): KunciBagian {
  const kunci = Array.isArray(nilai) ? nilai[0] : nilai;
  return kunci && (URUTAN_BAGIAN as string[]).includes(kunci)
    ? (kunci as KunciBagian)
    : "ringkasan";
}

export function navAktif(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
