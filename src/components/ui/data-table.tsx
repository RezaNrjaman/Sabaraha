import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type KolomDataTable<T> = {
  key: string;
  header: string;
  /** Perataan kolom; bawaan kolom pertama kiri, sisanya kanan. */
  rata?: "kiri" | "kanan";
  isi: (baris: T) => ReactNode;
  /** Nilai untuk kartu ponsel; bila kosong memakai `isi`. */
  isiPonsel?: (baris: T) => ReactNode;
  /** Tampilan utama di kartu ponsel (biasanya kolom pertama). */
  utama?: boolean;
  /** Jadikan header bisa diurutkan. */
  urut?: { aktif: boolean; arah: "asc" | "desc"; onUbah: () => void };
  className?: string;
};

/**
 * Tabel data bersama: header 14 px/600 berlatar abu sangat muda, angka
 * tabular rata kanan, baris 56 px, garis pemisah 1 px, pembungkus
 * overflow-x:auto. Di ponsel berubah menjadi daftar kartu.
 */
export function DataTable<T>({
  kolom,
  baris,
  kunci,
  caption,
  kosong,
  className,
  minLebar = 640,
  kartuPonsel,
}: {
  kolom: KolomDataTable<T>[];
  baris: T[];
  kunci: (baris: T, index: number) => string;
  caption?: string;
  kosong?: ReactNode;
  className?: string;
  minLebar?: number;
  /** Renderer kartu ponsel khusus; bila kosong memakai daftar label/nilai. */
  kartuPonsel?: (baris: T) => ReactNode;
}) {
  const rataKolom = (kolom: KolomDataTable<T>, index: number) =>
    kolom.rata ?? (index === 0 ? "kiri" : "kanan");

  if (baris.length === 0 && kosong) {
    return <>{kosong}</>;
  }

  const indeksUtama = Math.max(
    0,
    kolom.findIndex((item) => item.utama),
  );
  const sampingan = kolom.filter((_, index) => index !== indeksUtama);

  return (
    <div className={cn("w-full", className)}>
      <div className="hidden w-full overflow-x-auto md:block">
        <table
          className="w-full border-collapse text-base tabular-nums"
          style={{ minWidth: minLebar }}
        >
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr>
              {kolom.map((item, index) => {
                const kanan = rataKolom(item, index) === "kanan";
                return (
                  <th
                    key={item.key}
                    scope="col"
                    aria-sort={
                      item.urut
                        ? item.urut.arah === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className={cn(
                      "bg-bg px-3 py-1.5 text-ink-muted",
                      kanan ? "text-right" : "text-left",
                      item.className,
                    )}
                  >
                    {item.urut ? (
                      <button
                        type="button"
                        onClick={item.urut.onUbah}
                        className={cn(
                          "inline-flex min-h-11 items-center gap-1 text-sm font-semibold transition-colors hover:text-primary-700",
                          kanan && "w-full justify-end",
                        )}
                      >
                        {item.header}
                        {item.urut.aktif ? (
                          item.urut.arah === "asc" ? (
                            <ArrowUp size={14} aria-hidden="true" />
                          ) : (
                            <ArrowDown size={14} aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown size={14} aria-hidden="true" className="opacity-40" />
                        )}
                      </button>
                    ) : (
                      <span
                        className={cn(
                          "inline-flex min-h-11 items-center text-sm font-semibold",
                          kanan && "w-full justify-end",
                        )}
                      >
                        {item.header}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {baris.map((barisItem, index) => (
              <tr key={kunci(barisItem, index)} className="border-t border-line">
                {kolom.map((item, kolomIndex) => (
                  <td
                    key={item.key}
                    className={cn(
                      "h-14 px-3 py-3 align-middle",
                      rataKolom(item, kolomIndex) === "kanan" ? "text-right" : "text-left",
                      item.className,
                    )}
                  >
                    {item.isi(barisItem)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Versi ponsel: satu baris menjadi satu kartu. */}
      <ul className="md:hidden">
        {baris.map((barisItem, index) => (
          <li
            key={`ponsel-${kunci(barisItem, index)}`}
            className="border-t border-line py-4 first:border-t-0 first:pt-0"
          >
            {kartuPonsel ? (
              kartuPonsel(barisItem)
            ) : (
              <>
                <div className="min-w-0">{kolom[indeksUtama].isi(barisItem)}</div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                  {sampingan.map((item) => (
                    <div key={item.key} className="min-w-0">
                      <dt className="text-sm text-ink-muted">{item.header}</dt>
                      <dd className="mt-0.5 truncate text-base font-medium tabular-nums text-ink">
                        {item.isiPonsel?.(barisItem) ?? item.isi(barisItem)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
