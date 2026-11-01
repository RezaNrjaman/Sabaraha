import type { ReactNode } from "react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { cobaAmbil } from "@/lib/api";
import type { InfoData, Komoditas } from "@/lib/types";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const info = await cobaAmbil<InfoData>("/info");
  const komoditas = (await cobaAmbil<Komoditas[]>("/komoditas")) ?? [];

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className="md:pl-[76px] lg:pl-[260px]">
        <Topbar info={info} komoditas={komoditas} />
        <main
          id="konten"
          className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-6 sm:px-6 md:pb-10 lg:px-8"
        >
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
