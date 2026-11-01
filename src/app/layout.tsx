import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sabaraha — Harga Pangan Kota Bandung",
    template: "%s — Sabaraha",
  },
  description:
    "Dashboard harga dan ketersediaan pangan Kota Bandung dari data Bank Indonesia – PIHPS Nasional.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
