import Link from "next/link";
import { CalendarCheck2, Database, Search, TriangleAlert } from "lucide-react";

import { TextSize } from "@/components/layout/text-size";
import { Chip } from "@/components/ui/status-chip";
import { formatTanggal } from "@/lib/format";
import type { InfoData, Komoditas } from "@/lib/types";

function dataTerlaluLama(tanggal: string | null | undefined): boolean {
  if (!tanggal) return false;
  const lalu = new Date(`${tanggal}T00:00:00Z`).getTime();
  const hari = (Date.now() - lalu) / (1000 * 60 * 60 * 24);
  return hari > 14;
}

export function Topbar({
  info,
  komoditas,
}: {
  info: InfoData | null;
  komoditas: Komoditas[];
}) {
  const tanggal = info?.tanggal_data_terakhir ?? null;
  const lama = dataTerlaluLama(tanggal);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2 md:hidden">
          <span className="inline-flex size-9 items-center justify-center rounded-ctl bg-primary-600 text-white">
            <Database size={18} />
          </span>
          <span className="text-lg font-bold text-primary-700">Sabaraha</span>
        </Link>

        <form action="/tren" method="get" className="order-3 w-full sm:order-2 sm:max-w-sm md:order-1 md:flex-1">
          <label className="relative block">
            <span className="sr-only">Cari komoditas</span>
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              name="komoditas"
              list="daftar-komoditas"
              placeholder="Cari komoditas…"
              className="h-12 w-full rounded-ctl border border-line bg-bg/60 pl-10 pr-3 text-base text-ink placeholder:text-ink-muted/70 focus:border-primary-500 focus:bg-surface"
            />
            <datalist id="daftar-komoditas">
              {komoditas.map((item) => (
                <option key={item.id} value={item.nama} />
              ))}
            </datalist>
          </label>
        </form>

        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
          <Chip
            tone={lama ? "perhatian" : "netral"}
            icon={lama ? <TriangleAlert size={14} /> : <CalendarCheck2 size={14} />}
            className="hidden sm:inline-flex"
          >
            Data terakhir: {formatTanggal(tanggal)}
          </Chip>
          <Chip
            tone={lama ? "perhatian" : "netral"}
            icon={lama ? <TriangleAlert size={14} /> : <CalendarCheck2 size={14} />}
            className="sm:hidden"
          >
            {formatTanggal(tanggal)}
          </Chip>
          <TextSize />
        </div>
      </div>
    </header>
  );
}
