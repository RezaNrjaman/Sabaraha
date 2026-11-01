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

export const navItems: NavItem[] = [
  {
    href: "/",
    label: "Ringkasan",
    shortLabel: "Ringkasan",
    description: "KPI dan kondisi harga terkini",
    icon: LayoutDashboard,
  },
  {
    href: "/tren",
    label: "Tren Harga",
    shortLabel: "Tren",
    description: "Pergerakan harga dan perbandingan",
    icon: LineChart,
  },
  {
    href: "/periode",
    label: "Periode & Musiman",
    shortLabel: "Periode",
    description: "Pola Ramadan, Lebaran, dan musim",
    icon: CalendarDays,
  },
  {
    href: "/volatilitas",
    label: "Volatilitas",
    shortLabel: "Volatil.",
    description: "Komoditas paling bergejolak",
    icon: Activity,
  },
  {
    href: "/ketersediaan",
    label: "Ketersediaan",
    shortLabel: "Tersedia",
    description: "Status pasokan (data simulasi)",
    icon: Package,
  },
  {
    href: "/prediksi",
    label: "Prediksi",
    shortLabel: "Prediksi",
    description: "Perkiraan kenaikan periode berikutnya",
    icon: TrendingUp,
  },
  {
    href: "/info",
    label: "Info Data",
    shortLabel: "Info",
    description: "Sumber, metode, dan keterbatasan",
    icon: Info,
  },
];

export function navAktif(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
